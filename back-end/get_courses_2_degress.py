from get_classes_for_degreee import get_remaining_courses

def compare_degrees(degree1, degree2, taken_courses):
    """
    Compare two degrees and find overlapping courses.

    :param degree1: First degree program name
    :param degree2: Second degree program name
    :param taken_courses: List of courses already taken
    :return: Dictionary with overlapping and unique remaining courses
    """

    # Get remaining courses for both degrees
    remaining_courses_1 = get_remaining_courses(degree1, taken_courses, full_view=False)
    remaining_courses_2 = get_remaining_courses(degree2, taken_courses, full_view=False)

    # Extract courses from the remaining requirements safely
    courses_1 = set()
    courses_2 = set()

    for req in remaining_courses_1.values():
        if isinstance(req, dict) and "available_courses" in req:
            courses_1.update(req.get("available_courses", []))  # Ensure it's a list

    for req in remaining_courses_2.values():
        if isinstance(req, dict) and "available_courses" in req:
            courses_2.update(req.get("available_courses", []))  # Ensure it's a list

    # Find overlapping courses (common courses required in both degrees)
    overlapping_courses = courses_1.intersection(courses_2)

    # Unique remaining courses for each degree (excluding overlaps)
    unique_remaining_1 = courses_1 - overlapping_courses
    unique_remaining_2 = courses_2 - overlapping_courses

    # Format the result in a dictionary
    result = {
        f"Overlapping courses for {degree1} and {degree2}": list(overlapping_courses),
        f"{degree1} remaining courses": list(unique_remaining_1),
        f"{degree2} remaining courses": list(unique_remaining_2)
    }

    return result


# Example Usage
if __name__ == "__main__":
    degree1 = "B.S. Computer Science - Data Science Concentration"
    degree2 = "Statistics Minor"
    taken_courses = []
    comparison_result = compare_degrees(degree1, degree2, taken_courses)

    # Print the result
    import json
    print(json.dumps(comparison_result, indent=4))
