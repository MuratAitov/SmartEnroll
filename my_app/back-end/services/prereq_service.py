import json
from typing import Optional, Dict, Set, List
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_prerequisite_graph(
    course_code: str,
    include_all_levels: bool = False,
    visited: Optional[Set[str]] = None,
    nodes: Optional[List[Dict]] = None,
    edges: Optional[List[Dict]] = None
) -> Dict:
    """
    Рекурсивно строит граф пререквизитов для заданного course_code.

    Возвращает словарь вида:
        {
            "nodes": [
                {"id": "CPSC 321", "name": "Database Management Systems"},
                {"id": "CPSC 122", "name": "Computational Thinking"},
                ...
            ],
            "edges": [
                {"source": "CPSC 122", "target": "CPSC 321", "relation": "and/or", "min_grade": "D"},
                ...
            ]
        }

    Параметры:
        course_code (str): Код курса (например, "CPSC 321").
        include_all_levels (bool): Если True, то рекурсивно подтягивает все уровни пререквизитов.
        visited (Set[str]): Множество уже посещённых курсов (для защиты от циклов).
        nodes (List[Dict]): Список узлов (накопленный).
        edges (List[Dict]): Список рёбер (накопленный).
    """

    # Инициализируем множества/списки при первом вызове
    if visited is None:
        visited = set()
    if nodes is None:
        nodes = []
    if edges is None:
        edges = []

    # Если этот курс уже посещали, пропускаем (чтобы избежать зацикливаний)
    if course_code in visited:
        return {"nodes": nodes, "edges": edges}

    visited.add(course_code)

    # 1. Получаем данные о текущем курсе (чтобы узнать его title)
    course_info = supabase.table("courses").select("*").eq("code", course_code).execute()
    if course_info.data and len(course_info.data) > 0:
        course_title = course_info.data[0].get("title", course_code)
    else:
        course_title = course_code  # fallback, если не нашли

    # 2. Добавляем текущий курс в nodes (если его там нет)
    if not any(n["id"] == course_code for n in nodes):
        nodes.append({"id": course_code, "name": course_title})

    # 3. Ищем записи в таблице prerequisites, где course_code = наш курс
    response = supabase.table("prerequisites").select("*").eq("course_code", course_code).execute()
    if not response.data:
        # Нет пререквизитов
        return {"nodes": nodes, "edges": edges}

    # 4. Для каждой записи проверяем поле prerequisite_schema
    for record in response.data:
        prereq_json = record.get("prerequisite_schema")
        if not prereq_json:
            continue

        # Если хранится в виде строки, распарсим
        if isinstance(prereq_json, str):
            prereq_data = json.loads(prereq_json)
        else:
            prereq_data = prereq_json

        # --- НОВАЯ ЛОГИКА: обрабатываем "короткий" и "полный" формат ---
        if "requirements" in prereq_data:
            # Это "полный" формат вида:
            # {
            #   "type": "and"/"or",
            #   "requirements": [ { "course": "...", "min_grade": "..." }, ... ]
            # }
            prereq_type = prereq_data.get("type", "and")
            requirements = prereq_data.get("requirements", [])
        else:
            # "Короткий" формат, например: {"course": "MATH 259", "min_grade": "D"}
            # Превращаем это в эквивалент "полного" вида:
            prereq_type = prereq_data.get("type", "and")  # по умолчанию and
            requirements = [prereq_data]

        # 5. Обрабатываем все requirements
        for req in requirements:
            child_course = req.get("course")
            min_grade = req.get("min_grade")

            if not child_course:
                continue

            # Получаем название дочернего курса
            child_info = supabase.table("courses").select("*").eq("code", child_course).execute()
            if child_info.data and len(child_info.data) > 0:
                child_title = child_info.data[0].get("title", child_course)
            else:
                child_title = child_course

            # Добавляем узел для дочернего курса, если его ещё нет
            if not any(n["id"] == child_course for n in nodes):
                nodes.append({"id": child_course, "name": child_title})

            # Создаём ребро (из child_course -> course_code)
            edges.append({
                "source": child_course,
                "target": course_code,
                "relation": prereq_type,
                "min_grade": min_grade
            })

            # Если нужно рекурсивно все уровни, спускаемся дальше
            if include_all_levels:
                build_prerequisite_graph(
                    course_code=child_course,
                    include_all_levels=True,
                    visited=visited,
                    nodes=nodes,
                    edges=edges
                )

    # Возвращаем итог
    return {"nodes": nodes, "edges": edges}


# Ниже — пример локального теста, если хотите проверить в консоли:
if __name__ == "__main__":
    # Только непосредственные пререквизиты
    result_one_level = build_prerequisite_graph("MATH 260", include_all_levels=False)
    print("One-level prerequisite graph (MATH 260):", result_one_level)

    # Рекурсивно все уровни
    result_all_levels = build_prerequisite_graph("MATH 260", include_all_levels=True)
    print("All-levels prerequisite graph (MATH 260):", result_all_levels)
