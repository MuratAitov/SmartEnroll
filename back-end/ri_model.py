import gym
from gym import spaces
import numpy as np
import random
from collections import defaultdict
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
from stable_baselines3 import PPO

# Constants\ nMAX_TERMS = 8
MAX_PER_TERM = 4

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_requirement_courses(major_program: str) -> list[str]:
    # Выбираем program_id
    resp = supabase.table("programs").select("program_id").eq(
        "degree_program", major_program
    ).execute()
    if not resp.data:
        raise ValueError(f"Program '{major_program}' not found")
    pid = resp.data[0]["program_id"]

    # Получаем список курсов
    resp2 = supabase.table("requirement_courses").select("course_code").eq(
        "group_id", pid
    ).execute()
    return sorted({r["course_code"] for r in (resp2.data or [])})


def fetch_prerequisites() -> dict[str, dict]:
    resp = supabase.table("prerequisites").select(
        "course_code, prerequisite_schema"
    ).execute()
    return {r["course_code"]: r["prerequisite_schema"] for r in (resp.data or [])}


def schema_satisfied(schema: dict, taken: set[str]) -> bool:
    # Простое поле
    if not isinstance(schema, dict):
        return True
    if "course" in schema:
        return schema["course"] in taken
    # and / or
    typ = schema.get("type")
    reqs = schema.get("requirements", [])
    if typ == "and":
        return all(schema_satisfied(r, taken) for r in reqs)
    if typ == "or":
        return any(schema_satisfied(r, taken) for r in reqs)
    return True


def can_schedule(
    course: str,
    term: int,
    schedule: dict[int, list[str]],
    taken: set[str],
    prereq_map: dict[str, dict]
) -> bool:
    schema = prereq_map.get(course, {})
    if not schema_satisfied(schema, taken):
        return False
    # Проверка кореквизитов
    for cr in schema.get("corequisites", []):
        if cr not in taken and cr not in schedule[term]:
            return False
    return True


class CourseEnv(gym.Env):
    def __init__(self, student_id: int, major_program: str):
        super().__init__()
        # Загружаем курсы и схемы
        self.all_courses = fetch_requirement_courses(major_program)
        self.prereq_map = fetch_prerequisites()
        self.course_list = self.all_courses.copy()

        # Action: бинарный вектор возможных курсов
        self.action_space = spaces.MultiBinary(len(self.course_list))
        # Observation: битовый вектор и номер семестра
        self.observation_space = spaces.Dict({
            "taken": spaces.MultiBinary(len(self.course_list)),
            "term": spaces.Discrete(MAX_TERMS + 1)
        })
        self.reset()

    def reset(self):
        self.term = 1
        self.schedule = defaultdict(list)
        self.taken = set()
        return self._get_obs()

    def _get_obs(self):
        bitvec = np.array([1 if c in self.taken else 0 for c in self.course_list])
        return {"taken": bitvec, "term": self.term}

    def step(self, action):
        chosen = [self.course_list[i] for i, a in enumerate(action) if a]
        valid = []
        for c in chosen:
            if len(valid) < MAX_PER_TERM and \
               can_schedule(c, self.term, self.schedule, self.taken, self.prereq_map):
                valid.append(c)
        # Применяем выбранные курсы
        for c in valid:
            self.schedule[self.term].append(c)
            self.taken.add(c)
        self.term += 1
        done = set(self.all_courses).issubset(self.taken) or self.term > MAX_TERMS
        reward = 100 if done and set(self.all_courses).issubset(self.taken) else -1
        return self._get_obs(), reward, done, {}

    def render(self, mode="human"):
        for t in range(1, self.term):
            print(f"Term {t}: {', '.join(self.schedule[t])}")


if __name__ == "__main__":
    env = CourseEnv(student_id=1, major_program="B.S. Computer Science - Data Science Concentration")
    model = PPO("MultiInputPolicy", env, verbose=1)
    # Обучаем модель (нет pretrained!)
    model.learn(total_timesteps=200_000)
    model.save("course_scheduler_rl")

    # Загружаем и применяем
    model = PPO.load("course_scheduler_rl", env=env)
    obs = env.reset()
    done = False
    while not done:
        action, _ = model.predict(obs)
        obs, reward, done, _ = env.step(action)
    env.render()
