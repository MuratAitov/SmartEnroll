import json
from typing import Optional, Dict, Set, List
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_prerequisite_graph(course_code: str,
                             include_all_levels: bool = False,
                             visited: Optional[Set[str]] = None,
                             nodes: Optional[List[Dict]] = None,
                             edges: Optional[List[Dict]] = None) -> Dict:
    """
    Возвращает граф (nodes, edges) пререквизитов для заданного course_code.
    Не делаем проверок на ошибки/статус-код: если нет записей — вернём пустые data.
    """

    # Инициализируем структуры при первом вызове
    if visited is None:
        visited = set()
    if nodes is None:
        nodes = []
    if edges is None:
        edges = []

    # Если уже посещали этот курс, пропускаем (чтобы не зациклиться)
    if course_code in visited:
        return {"nodes": nodes, "edges": edges}

    visited.add(course_code)

    # Добавляем узел (если ещё не добавлен)
    if not any(n["id"] == course_code for n in nodes):
        nodes.append({"id": course_code})

    # Получаем все записи из таблицы "prerequisites" с таким course_code
    response = supabase.table("prerequisites").select("*").eq("course_code", course_code).execute()

    # Если нет записей — значит нет пререквизитов
    if not response.data:
        return {"nodes": nodes, "edges": edges}

    # Предположим, берём только первую запись (или все, если у тебя несколько вариантов)
    record = response.data[0]
    prereq_json = record.get("prerequisite_schema")

    # Если поле пустое
    if not prereq_json:
        return {"nodes": nodes, "edges": edges}

    # Если поле хранится как строка, парсим
    if isinstance(prereq_json, str):
        prereq_data = json.loads(prereq_json)
    else:
        prereq_data = prereq_json

    # Считаем, что prereq_data имеет формат:
    # {
    #   "type": "or"/"and",
    #   "requirements": [
    #       {"course": "CPSC 322", "min_grade": "D"},
    #       ...
    #   ]
    # }
    prereq_type = prereq_data.get("type", "and")
    requirements = prereq_data.get("requirements", [])

    for req in requirements:
        child_course = req.get("course")
        min_grade = req.get("min_grade")

        if not child_course:
            continue

        # Добавляем узел
        if not any(n["id"] == child_course for n in nodes):
            nodes.append({"id": child_course})

        # Добавляем ребро: child_course → course_code
        edges.append({
            "source": child_course,
            "target": course_code,
            "relation": prereq_type,
            "min_grade": min_grade
        })

        # Если нужно собрать все уровни (рекурсия)
        if include_all_levels:
            build_prerequisite_graph(
                course_code=child_course,
                include_all_levels=True,
                visited=visited,
                nodes=nodes,
                edges=edges
            )

    return {
        "nodes": nodes,
        "edges": edges
    }


# Пример использования:
if __name__ == "__main__":
    # Только ближайшие пререквизиты
    result_one_level = build_prerequisite_graph("CPSC 321", include_all_levels=False)
    print("One-level prereq graph:", result_one_level)

    # Все уровни пререквизитов (рекурсивно)
    result_all_levels = build_prerequisite_graph("CPSC 321", include_all_levels=True)
    print("All-levels prereq graph:", result_all_levels)
