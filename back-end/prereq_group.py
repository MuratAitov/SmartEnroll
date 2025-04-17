import json
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
from combo import get_merged_requirements_for_student

# Инициализация клиента Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_prereq(schema):
    """
    Рекурсивно парсит JSON-схему пререквизитов.
    Если схема описывает конкретный курс, возвращает:
       {"type": "course", "course": <код курса>, "min_grade": <значение>}
    Если содержит оператор "and"/"or", возвращает дерево правил.
    """
    if not schema:
        return None
    if isinstance(schema, str):
        try:
            schema = json.loads(schema)
        except Exception as e:
            print(f"Ошибка парсинга JSON: {e}")
            return None
    if isinstance(schema, dict):
        if "course" in schema:
            return {"type": "course", "course": schema["course"], "min_grade": schema.get("min_grade")}
        elif "type" in schema and "requirements" in schema:
            op = schema["type"].lower()
            if op in ["and", "or"]:
                parsed_reqs = []
                for req in schema.get("requirements", []):
                    parsed = parse_prereq(req)
                    if parsed is not None:
                        parsed_reqs.append(parsed)
                return {"type": op, "requirements": parsed_reqs}
    return None

def get_course_prereq_map() -> dict:
    """
    Считывает таблицу 'prerequisites' из Supabase и возвращает словарь вида:
       {
         "CPSC 223": parsed_schema,
         "CPSC 346": parsed_schema,
         ...
       }
    Если для курса нет записи или значение недопустимо, считается, что у него нет пререквизитов.
    """
    resp = supabase.table("prerequisites") \
        .select("course_code, prerequisite_schema") \
        .execute()
    prereq_map = {}
    if not resp.data:
        return prereq_map

    for row in resp.data:
        course = row.get("course_code")
        schema = row.get("prerequisite_schema")
        parsed = parse_prereq(schema)
        if parsed is None:
            # Если запись отсутствует или невалидна, считаем, что у курса нет зависимостей.
            parsed = {"type": "course", "course": course, "min_grade": None}
        prereq_map[course] = parsed
    return prereq_map

def is_prereq_satisfied(prereq, satisfied, is_leaf=False):
    """
    Рекурсивно проверяет, удовлетворены ли пререквизиты.
    Для требования типа "course":
      - Если is_leaf=True, возвращает True (в верхнем уровне считаем, что курс доступен для планирования).
      - Если is_leaf=False, возвращает True, если курс уже содержится в множестве satisfied.
    Для операторов "and"/"or" рекурсивно проверяет подусловия.
    """
    if prereq is None:
        return True
    typ = prereq.get("type")
    if typ == "course":
        if is_leaf:
            return True
        else:
            return prereq.get("course") in satisfied
    elif typ == "and":
        return all(is_prereq_satisfied(r, satisfied, is_leaf=False) for r in prereq.get("requirements", []))
    elif typ == "or":
        return any(is_prereq_satisfied(r, satisfied, is_leaf=False) for r in prereq.get("requirements", []))
    return True

def compute_prereq_layers_nested(prereq_map: dict, courses: list, debug: bool = False) -> list:
    """
    Получает нормализованную карту пререквизитов и список курсов, и распределяет их на слои.
    Для верхнего уровня проверки (сам курс) используется is_leaf=True.
    """
    # Если для курса нет записи в prereq_map, считаем, что у него нет пререквизитов.
    for c in courses:
        if c not in prereq_map:
            prereq_map[c] = {"type": "course", "course": c, "min_grade": None}
    layers = []
    satisfied = set()  # курсы, которые уже "взяты" (планируются ранее)
    remaining = set(courses)
    iteration = 0
    while remaining:
        available = []
        if debug:
            print(f"\nИтерация {iteration}. Уже доступные курсы: {', '.join(sorted(satisfied)) if satisfied else 'None'}")
        for c in list(remaining):
            prereq = prereq_map.get(c)
            if is_prereq_satisfied(prereq, satisfied, is_leaf=True):
                available.append(c)
            elif debug:
                # Можно добавить дополнительный вывод, какие курсы отсутствуют – опционально.
                pass
        if not available:
            if debug:
                print("Нет доступных курсов на данной итерации. Возможно, есть циклические зависимости.")
            break
        layers.append(available)
        if debug:
            print(f"Слой {iteration}: {', '.join(available)}")
        satisfied.update(available)
        remaining.difference_update(available)
        iteration += 1
    return layers

def plan_major_prerequisite_order(student_id: int, major_program_name: str):
    """
    Использует функцию get_merged_requirements_for_student для получения списка курсов (по их ID),
    которые студент должен пройти по major‑требованиям (Core‑курсы игнорируются),
    а затем распределяет эти курсы на слои (порядок прохождения) на основе нормализованной карты пререквизитов.
    """
    # Получаем объединённые требования
    reqs = get_merged_requirements_for_student(student_id, major_program_name, full_view=False)
    major_reqs = reqs.get("major_requirements", {})
    
    # Собираем все курсы из major‑требований.
    # Предполагается, что в major‑группах поле available_courses задано как список.
    needed_courses = set()
    for group in major_reqs.values():
        courses = group.get("available_courses", [])
        if isinstance(courses, list):
            needed_courses.update(courses)
    needed_courses = list(needed_courses)
    
    if not needed_courses:
        print("Все major требования уже выполнены или отсутствуют данные.")
        return
    
    # Получаем нормальную карту пререквизитов (без заглушек)
    prereq_map = get_course_prereq_map()
    # Вычисляем слои для major‑курсов
    layers = compute_prereq_layers_nested(prereq_map, needed_courses, debug=True)
    
    print("\nПлан прохождения major курсов (слои):")
    for i, layer in enumerate(layers):
        print(f"Слой {i}: {', '.join(layer)}")
    return layers

# Пример использования:
if __name__ == "__main__":
    # Предположим, студент с ID=1 и major-программа "B.S. Computer Science - Data Science Concentration"
    plan_major_prerequisite_order(student_id=1, major_program_name="B.S. Computer Science - Data Science Concentration")