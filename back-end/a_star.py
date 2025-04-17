from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
from itertools import combinations
import heapq
import math
from typing import FrozenSet
from combo import get_merged_requirements_for_student

# Инициализация Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Константы
MAX_PER_TERM = 4


def fetch_prerequisites() -> dict[str, dict]:
    """
    Загрузка схем пререквизитов и кореквизитов из таблицы prerequisites.
    """
    resp = supabase.table("prerequisites").select(
        "course_code, prerequisite_schema"
    ).execute()
    return {r["course_code"]: r["prerequisite_schema"] for r in (resp.data or [])}


def schema_satisfied(schema: dict, taken: set[str]) -> bool:
    """
    Рекурсивная проверка условий prereq:
    - если поле 'course' есть, проверяем в taken
    - if 'and'/'or' объединяем
    """
    if not isinstance(schema, dict):
        return True
    if "course" in schema:
        return schema["course"] in taken
    typ = schema.get("type")
    reqs = schema.get("requirements", [])
    if typ == "and":
        return all(schema_satisfied(r, taken) for r in reqs)
    if typ == "or":
        return any(schema_satisfied(r, taken) for r in reqs)
    return True


def can_schedule(course: str,
                 term: int,
                 schedule: dict[int, list[str]],
                 taken: set[str],
                 prereq_map: dict[str, dict]) -> bool:
    """
    Проверка, можно ли взять курс:
    1) Все пререквизиты выполнены
    2) Кореквизиты (если есть) уже в taken или запланированы в этом term
    """
    schema = prereq_map.get(course, {})
    if not schema_satisfied(schema, taken):
        return False
    # проверка corequisites
    for cr in schema.get("corequisites", []):
        if cr not in taken and cr not in schedule.get(term, []):
            return False
    return True


def get_courses_to_take(student_id: int, major_program: str) -> set[str]:
    """
    Собирает из get_merged_requirements_for_student набор всех курсов,
    которые нужно взять (available_courses из core и major).
    """
    reqs = get_merged_requirements_for_student(
        student_id=student_id,
        major_program_name=major_program
    )
    to_take = set()
    for grp in reqs["core_requirements"].values():
        ac = grp.get("available_courses")
        if isinstance(ac, list):
            to_take |= set(ac)
    for grp in reqs["major_requirements"].values():
        ac = grp.get("available_courses")
        if isinstance(ac, list):
            to_take |= set(ac)
    return to_take


def heuristic(remaining_count: int) -> int:
    """
    Оценка минимального числа семестров, чтобы взять все оставшиеся:
    ceil(remaining_count / MAX_PER_TERM)
    """
    return math.ceil(remaining_count / MAX_PER_TERM)


def a_star_schedule(student_id: int, major_program: str) -> dict[int, list[str]]:
    """
    Генерация расписания A*-поиском: минимизируем номер финального семестра.
    """
    all_courses = get_courses_to_take(student_id, major_program)
    prereq_map = fetch_prerequisites()

    # Стартовое состояние: ничего не взято, term=1, пустое расписание
    start_taken: FrozenSet[str] = frozenset()
    start_term = 1
    start_schedule: dict[int, list[str]] = {}

    # Очередь: (f_score, taken, term, schedule)
    open_set = []
    h0 = heuristic(len(all_courses))
    heapq.heappush(open_set, (h0, start_taken, start_term, start_schedule))

    # Хранение лучшего g_score
    g_scores = {(start_taken, start_term): 0}

    while open_set:
        f, taken_fs, term, schedule = heapq.heappop(open_set)
        taken = set(taken_fs)
        # Если все курсы взяты — возвращаем расписание
        if taken == all_courses:
            return schedule

        remaining = all_courses - taken
        # Список доступных к взятию курсов
        candidates = [c for c in remaining
                      if can_schedule(c, term, schedule, taken, prereq_map)]

        # Перебираем все комбинации от 1 до MAX_PER_TERM
        for r in range(1, min(len(candidates), MAX_PER_TERM) + 1):
            for combo in combinations(candidates, r):
                new_taken = taken.union(combo)
                new_taken_fs = frozenset(new_taken)
                new_term = term + 1
                new_schedule = {**schedule, term: list(combo)}

                g_new = term  # стоимость = номер предыдущего term
                key = (new_taken_fs, new_term)
                if g_scores.get(key, float('inf')) <= g_new:
                    continue
                g_scores[key] = g_new

                h_new = heuristic(len(all_courses - new_taken))
                f_new = g_new + h_new
                heapq.heappush(open_set, (f_new, new_taken_fs, new_term, new_schedule))

    raise RuntimeError("Не удалось найти расписание")


if __name__ == "__main__":
    sched = a_star_schedule(
        student_id=1,
        major_program="B.S. Computer Science - Data Science Concentration"
    )
    print("========== A* 4-YEAR SCHEDULE ==========")
    for term in sorted(sched):
        print(f"Term {term}: {', '.join(sched[term])}")
