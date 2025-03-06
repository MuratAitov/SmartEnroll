import json
from typing import Optional, Dict, Set, List
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_prerequisite_graph(course_code, include_all_levels=False):
    """
    Builds a prerequisite graph for a given course
    
    Args:
        course_code (str): The course code to build the graph for
        include_all_levels (bool): Whether to include all levels of prerequisites
        
    Returns:
        dict: A dictionary containing nodes and links for the graph
    """
    try:
        # Get the course information
        course_response = supabase.from_('courses').select('*').eq('code', course_code).execute()
        if not course_response.data:
            return {"error": f"Course {course_code} not found"}
        
        course = course_response.data[0]
        
        # Initialize the graph
        graph = {
            "nodes": [{"id": course_code, "name": course["title"], "level": 0}],
            "links": []
        }
        
        # Get direct prerequisites
        prereq_response = supabase.from_('prerequisites').select('*').eq('course_code', course_code).execute()
        
        if not prereq_response.data:
            return graph  # No prerequisites
        
        # Process prerequisites
        for prereq in prereq_response.data:
            prereq_code = prereq["prereq_code"]
            
            # Get prerequisite course info
            prereq_course_response = supabase.from_('courses').select('*').eq('code', prereq_code).execute()
            if prereq_course_response.data:
                prereq_course = prereq_course_response.data[0]
                
                # Add node if not already in graph
                if not any(node["id"] == prereq_code for node in graph["nodes"]):
                    graph["nodes"].append({
                        "id": prereq_code,
                        "name": prereq_course["title"],
                        "level": 1
                    })
                
                # Add link
                graph["links"].append({
                    "source": prereq_code,
                    "target": course_code,
                    "type": "PREREQ"
                })
                
                # If include_all_levels is True, recursively get prerequisites of prerequisites
                if include_all_levels:
                    nested_graph = build_prerequisite_graph(prereq_code, True)
                    
                    # Add nodes and links from nested graph if they don't already exist
                    for node in nested_graph.get("nodes", []):
                        if not any(n["id"] == node["id"] for n in graph["nodes"]):
                            # Increment level
                            node["level"] = node["level"] + 1
                            graph["nodes"].append(node)
                    
                    for link in nested_graph.get("links", []):
                        if not any(l["source"] == link["source"] and l["target"] == link["target"] for l in graph["links"]):
                            graph["links"].append(link)
        
        return graph
    
    except Exception as e:
        print(f"Error building prerequisite graph: {str(e)}")
        return {"error": f"Failed to build prerequisite graph: {str(e)}"}

# Mock data for testing without database
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

#
if __name__ == "__main__":
    result_one_level = build_prerequisite_graph("CPSC 321", include_all_levels=False)
    print("One-level prereq graph:", result_one_level)

    result_all_levels = build_prerequisite_graph("CPSC 321", include_all_levels=True)
    print("All-levels prereq graph:", result_all_levels)
