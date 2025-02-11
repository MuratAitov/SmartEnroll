SELECT 
    g.name AS requirement_group,
    c.course_code,
    co.title AS course_title
FROM programs p
JOIN requirement_groups g ON p.program_id = g.program_id
LEFT JOIN requirement_courses c ON g.id = c.group_id
LEFT JOIN courses co ON c.course_code = co.code
WHERE p.degree_program = 'B.S. Computer Science - Data Science Concentration'
AND g.selection_type = 'ALL'
ORDER BY g.name, c.course_code;


SELECT 
    g.name AS requirement_group,
    g.req_credits,
    c.course_code,
    co.title AS course_title
FROM programs p
JOIN requirement_groups g ON p.program_id = g.program_id
LEFT JOIN requirement_courses c ON g.id = c.group_id
LEFT JOIN courses co ON c.course_code = co.code
WHERE p.degree_program = 'B.S. Computer Science - Data Science Concentration'
AND g.selection_type = 'MIN'
ORDER BY g.name, c.course_code;