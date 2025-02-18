SELECT 
    g.name AS requirement,
    g.json_group_id as id,
    g.req_credits,
    g.note,
    c.course_code,
    co.title AS course_title
FROM programs p
JOIN requirement_groups g ON p.program_id = g.program_id
LEFT JOIN requirement_courses c ON g.id = c.group_id
LEFT JOIN courses co ON c.course_code = co.code
WHERE p.degree_program = 'B.S. Computer Science - Data Science Concentration'
AND g.selection_type = 'MIN'
ORDER BY g.name, c.course_code;


SELECT 
    g.name AS requirement,
    g.json_group_id as id,
    g.req_credits,
    g.note,
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
    g.name AS requirement,
    g.json_group_id as id,
    g.selection_type as type,
    g.req_credits,
    g.note,
    c.course_code,
    c.is_exclusion as excl
    co.title AS course_title
FROM programs p
JOIN requirement_groups g ON p.program_id = g.program_id
LEFT JOIN requirement_courses c ON g.id = c.group_id
LEFT JOIN courses co ON c.course_code = co.code
WHERE p.degree_program = 'B.S. Computer Science - Data Science Concentration'

ORDER BY g.json_group_id, c.course_code;


PGGSSENCMODE=disable psql "postgresql://postgres.lonyqfwfjvpmsxsfcing:bupkor-numhad-Debma8@aws-0-us-west-1.pooler.supabase.com:5432/postgres"