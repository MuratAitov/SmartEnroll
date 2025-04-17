from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
import json
import re

# ===================== КЛАСС ДЕРЕВА ПРЕРЕКВИЗИТОВ =====================

class PrereqNode:
    def __init__(self, node_type: str, course: str = None, min_grade: str = None, children: list = None):
        """
        :param node_type: Тип узла: "course", "and" или "or"
        :param course: Код курса (только для узлов типа "course")
        :param min_grade: Минимальная оценка (если требуется)
        :param children: Список дочерних узлов (для операторов)
        """
        self.node_type = node_type.lower()  # "course", "and", "or"
        self.course = course
        self.min_grade = min_grade
        self.children = children if children is not None else []
        self.taken = False  # Флаг, что курс уже пройден или записан

    def mark_taken(self, taken_courses: set):
        """Рекурсивно отмечает узлы, если код курса присутствует в taken_courses."""
        if self.node_type == "course":
            self.taken = self.course in taken_courses
        else:
            for child in self.children:
                child.mark_taken(taken_courses)

    def pretty_print(self, indent: int = 0):
        """Выводит дерево с отступами и цветовой раскраской:
           - Курсы, взятые студентом, выводятся зелёным,
           - узлы AND – синим, узлы OR – жёлтым.
        """
        spacer = " " * indent
        RESET = "\033[0m"
        GREEN = "\033[92m"
        BLUE = "\033[94m"
        YELLOW = "\033[93m"

        if self.node_type == "course":
            if self.taken:
                print(f"{spacer}{GREEN}Course: {self.course} (Taken){RESET}")
            else:
                grade_info = f", Min Grade: {self.min_grade}" if self.min_grade is not None else ""
                print(f"{spacer}Course: {self.course}{grade_info}")
        else:
            color = BLUE if self.node_type == "and" else YELLOW
            print(f"{spacer}{color}{self.node_type.upper()}:{RESET}")
            for child in self.children:
                child.pretty_print(indent + 4)

    def __repr__(self):
        if self.node_type == "course":
            return f"Course({self.course}, Taken: {self.taken}, Min Grade: {self.min_grade})"
        else:
            return f"{self.node_type.upper()}({self.children})"

def build_prereq_tree(schema: dict) -> PrereqNode:
    """Рекурсивно строит дерево пререквизитов из словаря."""
    node_type = schema.get("type", "course").lower()
    if node_type == "course":
        return PrereqNode(node_type="course", course=schema["course"], min_grade=schema.get("min_grade"))
    elif node_type in ("and", "or"):
        children = [build_prereq_tree(child) for child in schema.get("requirements", [])]
        return PrereqNode(node_type=node_type, children=children)
    else:
        raise ValueError(f"Unknown node type: {node_type}")

def extract_courses_from_tree(node: PrereqNode) -> set:
    """Рекурсивно собирает все курсы (узлы типа 'course') из дерева."""
    if node is None:
        return set()
    if node.node_type == "course":
        return {node.course}
    courses = set()
    for child in node.children:
        courses |= extract_courses_from_tree(child)
    return courses

# ===================== ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ТРЕБОВАНИЙ =====================

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_prerequisite_schema(schema: dict) -> dict:
    """Рекурсивно парсит JSON-описание пререквизитов в дерево (словарь)."""
    if "type" in schema:
        node_type = schema["type"].lower()
        sub_reqs = schema.get("requirements", [])
        parsed_children = [parse_prerequisite_schema(r) for r in sub_reqs]
        return {"type": node_type, "requirements": parsed_children}
    else:
        return {"type": "course", "course": schema["course"], "min_grade": schema.get("min_grade", "D")}

def fetch_prerequisites_for_courses(course_codes: list, debug=False) -> dict:
    """Получает записи из таблицы 'prerequisites' для переданного набора course_codes."""
    if not course_codes:
        return {}
    resp = supabase.table("prerequisites").select("course_code, prerequisite_schema")\
                   .in_("course_code", course_codes).execute()
    if debug:
        print("[DEBUG] prerequisites fetch:", resp.data)
    result = {}
    for row in (resp.data or []):
        course_code = row["course_code"]
        schema = row["prerequisite_schema"]
        parsed_tree = parse_prerequisite_schema(schema)
        result[course_code] = parsed_tree
    return result

# (Функция get_merged_requirements_for_student оставляем почти без изменений,
#  но для новых студентов обрабатываем пустой список enrollments.)

def get_merged_requirements_for_student(student_id: int, major_program_name: str,
                                          core_program_name: str = "University Core Requirements",
                                          full_view: bool = False, debug: bool = False,
                                          visualize_trees: bool = False) -> dict:
    """
    Объединяет требования Core и Major для студента.
    Если у студента нет enrollments (новый студент), продолжаем с пустым списком.
    """
    resp_enroll = supabase.table("enrollments").select("section_id")\
                           .eq("user_id", student_id).execute()
    if not resp_enroll.data:
        if debug:
            print(f"[DEBUG] Student {student_id} has no enrollments.")
        student_sections = []  # Новый студент
    else:
        student_sections = [row for row in resp_enroll.data]
    
    if student_sections:
        section_ids = [row["section_id"] for row in student_sections]
        resp_secs = supabase.table("sections").select("course_id, term, section, attribute")\
                             .in_("section_id", section_ids).execute()
        student_sections = resp_secs.data or []
    else:
        student_sections = []
    
    taken_classes_core = []
    taken_courses_major = set()
    for sec in student_sections:
        c_id = sec["course_id"]
        t = sec["term"]
        s = sec["section"]
        taken_classes_core.append({"course_id": c_id, "term": t, "section": s})
        taken_courses_major.add(c_id)
    taken_courses_major = list(taken_courses_major)
    
    # CORE требования (аналогичный код, см. предыдущий вариант)
    core_requirements = {}
    resp_core_prog = supabase.table("programs").select("program_id")\
                          .eq("degree_program", core_program_name).execute()
    if resp_core_prog.data:
        core_program_id = resp_core_prog.data[0]["program_id"]
        resp_core_groups = supabase.table("requirement_groups").select("*")\
                              .eq("program_id", core_program_id).execute()
        core_groups = resp_core_groups.data or []
        for g in core_groups:
            g["json_id"] = g.get("json_group_id", 0)
        core_groups.sort(key=lambda x: int(x["json_id"] or 0))
        course_ids_for_core = {sec["course_id"] for sec in student_sections}
        resp_cr = supabase.table("courses").select("code, credits")\
                      .in_("code", list(course_ids_for_core)).execute()
        course_map_core = {row["code"]: row["credits"] for row in (resp_cr.data or [])}
        taken_info_core = {}
        for sec in student_sections:
            c_id = sec["course_id"]
            t = sec["term"]
            s = sec["section"]
            attr_str = sec.get("attribute", "") or ""
            core_attrs = [part[5:].strip() for part in attr_str.split(",") if part.strip().lower().startswith("core:")]
            c_credits = course_map_core.get(c_id, 0)
            taken_info_core[(c_id, t, s)] = {"core_attrs": core_attrs, "credits": c_credits}
        for group in core_groups:
            group_name = group["name"]
            group_json_id = int(group.get("json_id", 0))
            required_credits = group.get("req_credits", 0)
            group_id = group["id"]
            is_core_group = ("core" in group_name.lower())
            allocated_courses = []
            total_taken_credits = 0
            if is_core_group:
                lower_name = group_name.lower()
                if lower_name.startswith("core "):
                    expected_attribute = group_name[5:].strip()
                elif lower_name.endswith(" core"):
                    expected_attribute = group_name[:-4].strip()
                else:
                    parts = group_name.split()
                    filtered_parts = [p for p in parts if p.lower() != "core"]
                    expected_attribute = " ".join(filtered_parts).strip()
                for key, info in taken_info_core.items():
                    if expected_attribute and (expected_attribute in info["core_attrs"]):
                        allocated_courses.append(key[0])
                        total_taken_credits += info["credits"]
                available_courses_val = f"CORE {required_credits}"
            else:
                resp_req = supabase.table("requirement_courses").select("course_code")\
                              .eq("group_id", group_id).execute()
                potential_codes = {row["course_code"] for row in (resp_req.data or [])}
                for (c_id, t, s), info in taken_info_core.items():
                    if c_id in potential_codes:
                        allocated_courses.append(c_id)
                        total_taken_credits += info["credits"]
                potential_list = sorted(potential_codes)
                available_courses_val = potential_list
            remaining_credits = max(0, required_credits - total_taken_credits)
            core_requirements[group_name] = {
                "json_id": group_json_id,
                "required_credits": required_credits,
                "taken_credits": total_taken_credits,
                "remaining_credits": remaining_credits,
                "taken_courses_in_group": sorted(set(allocated_courses)),
                "available_courses": available_courses_val,
                "expected_attribute": expected_attribute if is_core_group else None
            }
            if debug:
                print(f"[DEBUG:CORE] {group_name} => allocated={allocated_courses}, total_credits={total_taken_credits}")

    # MAJOR требования (аналогично предыдущему коду)
    major_requirements = {}
    resp_major_prog = supabase.table("programs").select("program_id")\
                           .eq("degree_program", major_program_name).execute()
    if resp_major_prog.data:
        major_program_id = resp_major_prog.data[0]["program_id"]
        resp_major_groups = supabase.table("requirement_groups").select("*")\
                              .eq("program_id", major_program_id).execute()
        major_groups = resp_major_groups.data or []
        for mg in major_groups:
            mg["json_id"] = mg.get("json_group_id", 0)
            note = mg.get("note", "") or ""
            mg["double_count_groups"] = []
            if "Can double count with" in note:
                try:
                    parts = note.split("with")[-1].replace("(", "").replace(")", "").split(",")
                    mg["double_count_groups"] = [int(x.strip()) for x in parts if x.strip().isdigit()]
                except ValueError:
                    mg["double_count_groups"] = []
        major_groups.sort(key=lambda x: int(x["json_id"] or 0))
        resp_cr_maj = supabase.table("courses").select("code, credits")\
                          .in_("code", taken_courses_major).execute()
        course_map_major = {row["code"]: row["credits"] for row in (resp_cr_maj.data or [])}
        processed_groups = []
        for group in major_groups:
            group_name = group["name"]
            group_json_id = int(group.get("json_id") or 0)
            required_credits = group.get("req_credits", 0)
            group_id = group["id"]
            allowed_for_double = set(group["double_count_groups"])
            resp_req = supabase.table("requirement_courses").select("course_code")\
                          .eq("group_id", group_id).execute()
            potential_courses = {r["course_code"] for r in (resp_req.data or [])}
            allowed_set = set()
            exclusion_set = set()
            for (prev_json_id, allocated_set) in processed_groups:
                if prev_json_id in allowed_for_double:
                    allowed_set |= allocated_set
                else:
                    exclusion_set |= allocated_set
            available_courses = (potential_courses - exclusion_set) | (allowed_set & potential_courses)
            allocated_current = {c_id for c_id in available_courses if c_id in taken_courses_major}
            taken_credits = sum(course_map_major.get(c, 0) for c in allocated_current)
            remaining_credits = max(0, required_credits - taken_credits)
            processed_groups.append((group_json_id, allocated_current))
            display_available = sorted(available_courses - allocated_current)
            prereq_map = fetch_prerequisites_for_courses(list(potential_courses), debug=debug)
            prerequisites_for_group = {}
            for c in sorted(potential_courses):
                prerequisites_for_group[c] = prereq_map.get(c, None)
            major_requirements[group_name] = {
                "json_id": group_json_id,
                "required_credits": required_credits,
                "taken_credits": taken_credits,
                "remaining_credits": remaining_credits,
                "taken_courses_in_group": sorted(allocated_current),
                "available_courses": display_available,
                "double_count_groups": sorted(allowed_for_double),
                "prerequisites": prerequisites_for_group
            }
            if debug:
                print(f"[DEBUG:MAJOR] {group_name} => allocated={allocated_current}, taken_credits={taken_credits}")

    if full_view:
        # Вывод CORE и MAJOR требований (опущено здесь для краткости)
        pass

    if visualize_trees:
        # Вывод деревьев пререквизитов для MAJOR групп (опущено здесь для краткости)
        pass

    return {"core_requirements": core_requirements, "major_requirements": major_requirements}

# ===================== ФУНКЦИЯ ГЕНЕРАЦИИ ДЕРЕВА ДЛЯ STUDENTA =====================

def generate_student_major_prereq_trees(student_id: int, major_program_name: str,
                                         core_program_name: str = "University Core Requirements",
                                         debug: bool = False):
    """
    Для каждой группы major, для каждого курса с описанием пререквизитов строится дерево PrereqNode,
    после чего отмечаются, какие курсы уже взяты.
    Возвращает словарь вида:
       { group_name: { course_code: PrereqNode or None, ... }, ... }
    """
    reqs = get_merged_requirements_for_student(
        student_id=student_id,
        major_program_name=major_program_name,
        core_program_name=core_program_name,
        full_view=False,
        debug=debug,
        visualize_trees=False
    )
    major_reqs = reqs["major_requirements"]
    global_taken = set()
    for group in major_reqs.values():
        global_taken.update(group.get("taken_courses_in_group", []))
    trees = {}
    for group_name, group_info in major_reqs.items():
        prerequisites = group_info.get("prerequisites", {})
        group_trees = {}
        for course, schema in prerequisites.items():
            if schema is not None:
                try:
                    tree_node = build_prereq_tree(schema)
                    tree_node.mark_taken(global_taken)
                    group_trees[course] = tree_node
                except Exception as e:
                    if debug:
                        print(f"Error building tree for course {course}: {e}")
                    group_trees[course] = None
            else:
                group_trees[course] = None
        trees[group_name] = group_trees
    return trees

# ===================== ФУНКЦИЯ РЕКУРСИВНОЙ ПРОВЕРКИ ПРЕРЕКВИЗИТОВ =====================

def prerequisites_satisfied(tree_node: PrereqNode, completed_courses: set) -> bool:
    """Рекурсивно проверяет, удовлетворены ли условия дерева, используя completed_courses."""
    if tree_node is None:
        return True
    if tree_node.node_type == "course":
        return tree_node.course in completed_courses
    elif tree_node.node_type == "and":
        return all(prerequisites_satisfied(child, completed_courses) for child in tree_node.children)
    elif tree_node.node_type == "or":
        return any(prerequisites_satisfied(child, completed_courses) for child in tree_node.children)
    return False

# ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

def extract_course_number(course: str) -> int:
    """Извлекает числовую часть курса, например, из 'CPSC 121' вернёт 121."""
    match = re.search(r'\b(\d+)\b', course)
    if match:
        try:
            return int(match.group(1))
        except:
            return 0
    return 0

def is_accessible(course: str, tree_node: PrereqNode, completed_courses: set) -> bool:
    """
    Если курс 300+ и для него не задано дерево (tree_node is None), то возвращает False.
    Иначе, если для курса задано дерево, проверяет, удовлетворены ли пререквизиты.
    Для курсов ниже 300, если дерево отсутствует, считает курс доступным.
    """
    num = extract_course_number(course)
    if num >= 300:
        if tree_node is None:
            return False
        else:
            return prerequisites_satisfied(tree_node, completed_courses)
    else:
        # Для курсов ниже 300 – если дерево отсутствует, считаем их доступными.
        if tree_node is None:
            return True
        else:
            return prerequisites_satisfied(tree_node, completed_courses)

# ===================== ФУНКЦИЯ ГЕНЕРАЦИИ РАСПИСАНИЯ НА 4 ГОДА =====================

def generate_4year_schedule(student_id: int, major_program_name: str,
                            core_program_name: str = "University Core Requirements",
                            num_terms: int = 8, max_courses_per_term: int = 4,
                            debug: bool = False) -> dict:
    """
    Генерирует предварительное расписание на 4 года (например, 8 семестров) для major,
    учитывая пререквизиты.
    
    Алгоритм:
      1. Получаем требования.
      2. Собираем множество требуемых курсов (из available_courses) и уже взятых.
      3. Для каждого курса с описанием пререквизитов (из trees) извлекаем все курсы, присутствующие в дереве.
      4. future_courses = (требуемые курсы ∪ курсы из деревьев) – уже взятые.
      5. По семестрам выбираем из remaining_courses те, для которых курс доступен (с учётом
         проверки is_accessible).
    """
    # 1. Получаем требования
    reqs = get_merged_requirements_for_student(
        student_id=student_id,
        major_program_name=major_program_name,
        core_program_name=core_program_name,
        full_view=False,
        debug=debug,
        visualize_trees=False
    )
    major_reqs = reqs["major_requirements"]

    # 2. Собираем базовое множество требуемых курсов и уже взятых.
    required_courses = set()
    already_taken = set()
    for group in major_reqs.values():
        available = group.get("available_courses", [])
        if isinstance(available, list):
            required_courses.update(available)
        else:
            required_courses.add(available)
        already_taken.update(group.get("taken_courses_in_group", []))
    
    # 3. Добавляем курсы из деревьев пререквизитов.
    major_trees = generate_student_major_prereq_trees(student_id, major_program_name, core_program_name, debug=debug)
    for group_trees in major_trees.values():
        for course, tree in group_trees.items():
            if tree is not None:
                required_courses |= extract_courses_from_tree(tree)
    
    # 4. Курсы, которые нужно планировать.
    future_courses = required_courses - already_taken
    if debug:
        print(f"[DEBUG] Required courses: {required_courses}")
        print(f"[DEBUG] Already taken: {already_taken}")
        print(f"[DEBUG] Future courses: {future_courses}")

    # 5. Планирование по семестрам.
    schedule = {}
    completed_courses = set(already_taken)
    remaining_courses = set(future_courses)
    for term in range(1, num_terms + 1):
        available_this_term = []
        for course in list(remaining_courses):
            tree = None
            # Пытаемся найти дерево для курса из major_trees.
            for group_trees in major_trees.values():
                if course in group_trees:
                    tree = group_trees[course]
                    break
            if is_accessible(course, tree, completed_courses):
                available_this_term.append(course)
        # Выбираем не больше max_courses_per_term.
        selected = available_this_term[:max_courses_per_term]
        schedule[f"Term {term}"] = selected
        completed_courses.update(selected)
        remaining_courses -= set(selected)
        if debug:
            print(f"[DEBUG] Term {term}: selected={selected}, remaining_courses={remaining_courses}")
        if not remaining_courses:
            break
    return schedule

# ===================== ПРИМЕР ИСПОЛЬЗОВАНИЯ =====================

if __name__ == "__main__":
    # Пример использования для студента с ID=2 (новый студент)
    # Вывод требований и деревьев (для отладки)
    result = get_merged_requirements_for_student(
        student_id=2,
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        full_view=True,
        debug=True,
        visualize_trees=True
    )

    major_trees = generate_student_major_prereq_trees(
        student_id=2,
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        debug=True
    )

    print("\n========== GENERATED PREREQUISITE TREES ==========")
    for group_name, courses in major_trees.items():
        print(f"\nGroup: {group_name}")
        for course, tree in courses.items():
            print(f"\nCourse: {course}")
            if tree:
                tree.pretty_print(indent=4)
            else:
                print("    No prerequisites")

    # Генерируем расписание на 4 года (8 семестров)
    schedule = generate_4year_schedule(
        student_id=2,  # Новый студент (нет enrollments)
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        num_terms=8,
        max_courses_per_term=4,
        debug=True
    )

    print("\n========== 4-YEAR SCHEDULE ==========")
    for term, courses in schedule.items():
        print(f"{term}: {', '.join(courses) if courses else 'No courses scheduled'}")