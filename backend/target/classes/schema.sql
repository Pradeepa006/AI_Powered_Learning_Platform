-- DDL Database Schema for AI-Powered Learning Platform

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    profile_photo VARCHAR(500),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    title VARCHAR(255),
    skills VARCHAR(500),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    resume_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    preview_video_url VARCHAR(500),
    difficulty VARCHAR(50) NOT NULL,
    language VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    discount_price DOUBLE PRECISION,
    instructor_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category VARCHAR(255) NOT NULL,
    average_rating DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
    lesson_id INT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
    video_url VARCHAR(500) NOT NULL,
    duration_seconds INT,
    subtitles_url VARCHAR(500),
    transcript TEXT,
    hls_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage DOUBLE PRECISION DEFAULT 0.0,
    enrolled_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progresses (
    id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watch_time_seconds INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    time_limit_seconds INT,
    passing_score INT DEFAULT 60
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    points INT DEFAULT 10,
    options_json TEXT,
    correct_option_index INT,
    test_cases_json TEXT
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL,
    is_passed BOOLEAN NOT NULL,
    attempted_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    file_url VARCHAR(500),
    deadline TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    github_repo VARCHAR(255),
    submitted_at TIMESTAMP NOT NULL,
    grade DOUBLE PRECISION,
    feedback_text TEXT,
    ai_feedback_text TEXT
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issue_date TIMESTAMP NOT NULL,
    blockchain_tx_hash VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_histories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS gamification (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    last_login_date DATE
);

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    icon_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, badge_id)
);
