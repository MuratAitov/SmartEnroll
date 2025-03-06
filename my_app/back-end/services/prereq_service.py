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
    Recursively builds a prerequisite graph for a given course_code.
    
    The function returns a dictionary with the following structure:
    
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

    Args:
        course_code (str): The course code (e.g., "CPSC 321").
        include_all_levels (bool): If True, recursively retrieve all prerequisite levels.
        visited (Set[str]): A set of visited courses to prevent infinite loops.
        nodes (List[Dict]): A list of node dictionaries accumulated so far.
        edges (List[Dict]): A list of edge dictionaries accumulated so far.

    Returns:
        Dict: A dictionary containing "nodes" and "edges".
    """

    # Initialize sets/lists on the first call
    if visited is None:
        visited = set()
    if nodes is None:
        nodes = []
    if edges is None:
        edges = []

    # If this course_code was already visited, skip it to avoid cycles
    if course_code in visited:
        return {"nodes": nodes, "edges": edges}

    visited.add(course_code)

    # 1. Retrieve information about the current course to get its title
    course_info = supabase.table("courses").select("*").eq("code", course_code).execute()
    if course_info.data and len(course_info.data) > 0:
        course_title = course_info.data[0].get("title", course_code)
    else:
        course_title = course_code  # Fallback if no title is found

    # 2. Add the current course node if it's not already in the list
    if not any(n["id"] == course_code for n in nodes):
        nodes.append({"id": course_code, "name": course_title})

    # 3. Retrieve all records from the "prerequisites" table where course_code = our course
    response = supabase.table("prerequisites").select("*").eq("course_code", course_code).execute()
    if not response.data:
        # No records, so no prerequisites for this course
        return {"nodes": nodes, "edges": edges}

    # 4. For each record, there may be a JSON field "prerequisite_schema" describing the prerequisites
    for record in response.data:
        prereq_json = record.get("prerequisite_schema")
        if not prereq_json:
            continue

        # Parse the JSON if it's stored as a string
        if isinstance(prereq_json, str):
            prereq_data = json.loads(prereq_json)
        else:
            prereq_data = prereq_json

        # We assume the structure is something like:
        # {
        #   "type": "or" / "and",
        #   "requirements": [
        #       {"course": "CPSC 122", "min_grade": "D"},
        #       ...
        #   ]
        # }
        prereq_type = prereq_data.get("type", "and")  # default to "and"
        requirements = prereq_data.get("requirements", [])

        # 5. Iterate through each requirement in the list
        for req in requirements:
            child_course = req.get("course")
            min_grade = req.get("min_grade")

            if not child_course:
                continue

            # Get the child's course title
            child_info = supabase.table("courses").select("*").eq("code", child_course).execute()
            if child_info.data and len(child_info.data) > 0:
                child_title = child_info.data[0].get("title", child_course)
            else:
                child_title = child_course

            # Add the child course node if it's not already in the list
            if not any(n["id"] == child_course for n in nodes):
                nodes.append({"id": child_course, "name": child_title})

            # Create an edge from the child course to the current course
            edges.append({
                "source": child_course,
                "target": course_code,
                "relation": prereq_type,
                "min_grade": min_grade
            })

            # If we need all levels, recurse on the child course
            if include_all_levels:
                build_prerequisite_graph(
                    course_code=child_course,
                    include_all_levels=True,
                    visited=visited,
                    nodes=nodes,
                    edges=edges
                )

    # Return the accumulated nodes and edges
    return {"nodes": nodes, "edges": edges}


# Example usage for local testing
if __name__ == "__main__":
    # Only immediate prerequisites (no recursion)
    result_one_level = build_prerequisite_graph("CPSC 321", include_all_levels=False)
    print("One-level prerequisite graph:", result_one_level)

    # All prerequisite levels (recursive)
    result_all_levels = build_prerequisite_graph("CPSC 321", include_all_levels=True)
    print("All-levels prerequisite graph:", result_all_levels)




mock_graph = {
    "nodes": [
        {"id": "CPSC 321", "name": "Database Management Systems", "level": 0},
        {"id": "CPSC 224", "name": "Software Development", "level": 1},
        {"id": "CPSC 122", "name": "Computational Thinking", "level": 2}
    ],
    "links": [
        {"source": "CPSC 224", "target": "CPSC 321", "type": "PREREQ"},
        {"source": "CPSC 122", "target": "CPSC 224", "type": "PREREQ"}
    ]
}

# #
# if __name__ == "__main__":
#     result_one_level = build_prerequisite_graph("CPSC 325", include_all_levels=False)
#     print("One-level prereq graph:", result_one_level)

 