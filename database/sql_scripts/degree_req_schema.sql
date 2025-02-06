-- Таблица программ (major/minor)
CREATE TABLE IF NOT EXISTS programs (
    program_id SERIAL PRIMARY KEY,
    degree_program TEXT NOT NULL,
    college TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    language_requirement TEXT,
    program_type TEXT,         -- "major" или "minor"
    has_concentration BOOLEAN  -- для major: TRUE, если в названии есть слово "concentration"
);

-- Таблица групп требований
CREATE TABLE IF NOT EXISTS requirement_groups (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
    json_group_id INTEGER,
    name TEXT NOT NULL,
    req_credits INTEGER NOT NULL,
    selection_type TEXT NOT NULL,
    note TEXT
);

-- Таблица курсов в группах требований
CREATE TABLE IF NOT EXISTS requirement_courses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES requirement_groups(id) ON DELETE CASCADE,
    course_code VARCHAR NOT NULL REFERENCES courses(code),
    is_exclusion BOOLEAN DEFAULT FALSE
);
