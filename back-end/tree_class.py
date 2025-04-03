class PrereqNode:
    def __init__(self, node_type: str, course: str = None, min_grade: str = None, children: list = None):
        """
        :param node_type: Тип узла: "course", "and" или "or"
        :param course: Код курса (только для узлов типа "course")
        :param min_grade: Минимальная оценка (если требуется, для узлов "course")
        :param children: Список дочерних узлов (для узлов "and" или "or")
        """
        self.node_type = node_type.lower()  # "course", "and", "or"
        self.course = course
        self.min_grade = min_grade
        self.children = children if children is not None else []
        self.taken = False  # Флаг: курс уже пройден (или студент записан)

    def mark_taken(self, taken_courses: set):
        """
        Рекурсивно обходит дерево и для узлов типа "course" устанавливает флаг taken,
        если код курса содержится в taken_courses.

        :param taken_courses: Множество кодов курсов, которые студент уже прошёл/взял.
        """
        if self.node_type == "course":
            self.taken = self.course in taken_courses
        else:
            for child in self.children:
                child.mark_taken(taken_courses)

    def pretty_print(self, indent: int = 0):
        """
        Выводит дерево в консоль с отступами.
        Если узел типа "course" и курс уже взят, то выводится с другой (зелёной) раскраской.
        Узлы-операторы ("AND", "OR") выводятся в отличительном цвете.
        """
        spacer = " " * indent
        RESET = "\033[0m"
        GREEN = "\033[92m"
        BLUE = "\033[94m"
        YELLOW = "\033[93m"

        if self.node_type == "course":
            # Если курс взят, выводим его зелёным
            if self.taken:
                print(f"{spacer}{GREEN}Course: {self.course} (Taken){RESET}")
            else:
                grade_info = f", Min Grade: {self.min_grade}" if self.min_grade is not None else ""
                print(f"{spacer}Course: {self.course}{grade_info}")
        else:
            # Для операторов используем свой цвет
            color = BLUE if self.node_type == "and" else YELLOW
            print(f"{spacer}{color}{self.node_type.upper()}:{RESET}")
            for child in self.children:
                child.pretty_print(indent + 4)

    def __repr__(self):
        """
        Возвращает строковое представление узла (без цветовой раскраски).
        """
        if self.node_type == "course":
            return f"Course({self.course}, Taken: {self.taken}, Min Grade: {self.min_grade})"
        else:
            return f"{self.node_type.upper()}({self.children})"


def build_prereq_tree(schema: dict) -> PrereqNode:
    """
    Рекурсивно строит дерево пререквизитов из словаря.

    Пример входного словаря:

        {
            "type": "and",
            "requirements": [
                {"course": "CPSC 122", "min_grade": "D"},
                {
                    "type": "or",
                    "requirements": [
                        {"course": "CPSC 260"},
                        {
                            "type": "and",
                            "requirements": [
                                {"course": "CPEN 231"},
                                {"course": "CPEN 231L"}
                            ]
                        }
                    ]
                }
            ]
        }

    :param schema: Словарь с описанием пререквизитов.
    :return: Корневой узел дерева PrereqNode.
    """
    node_type = schema.get("type", "course").lower()
    if node_type == "course":
        return PrereqNode(node_type="course", course=schema["course"], min_grade=schema.get("min_grade"))
    elif node_type in ("and", "or"):
        children = [build_prereq_tree(child) for child in schema.get("requirements", [])]
        return PrereqNode(node_type=node_type, children=children)
    else:
        raise ValueError(f"Unknown node type: {node_type}")


# Пример использования:
if __name__ == "__main__":
    # Пример схемы для major "Computer Science" (можно заменить на данные из базы)
    schema_example = {
        "type": "and",
        "requirements": [
            {"course": "CPSC 121"},
            {"course": "CPSC 122", "min_grade": "D"},
            {
                "type": "or",
                "requirements": [
                    {"course": "CPSC 223", "min_grade": "D"},
                    {
                        "type": "and",
                        "requirements": [
                            {"course": "CPSC 224", "min_grade": "D"},
                            {"course": "CPSC 260", "min_grade": "D"}
                        ]
                    }
                ]
            }
        ]
    }

    # Строим дерево пререквизитов
    prereq_tree = build_prereq_tree(schema_example)
    print("Изначальное дерево пререквизитов для Computer Science:")
    prereq_tree.pretty_print()

    # Допустим, студент уже взял следующие курсы:
    taken_courses = {"CPSC 121", "CPSC 260"}
    prereq_tree.mark_taken(taken_courses)

    print("\nДерево пререквизитов после отметки взятых курсов:")
    prereq_tree.pretty_print()
