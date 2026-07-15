-- Insert a mock instructor
INSERT INTO users (id, name, email, password, role, is_email_verified, created_at, updated_at) 
VALUES (1, 'Dr. Alex Carter', 'instructor@example.com', '$2a$10$xyz', 'INSTRUCTOR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Course 5
INSERT INTO courses (id, title, subtitle, description, difficulty, language, price, instructor_id, category, status, created_at, updated_at)
VALUES (5, 'Full Stack Web Development (Mock Course)', 'Learn Next.js, Spring Boot, and AI', 'This is a complete course on full stack development. It contains everything you need to become a senior engineer.', 'BEGINNER', 'English', 49.99, 1, 'Programming', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Lessons for Course 5
INSERT INTO lessons (id, course_id, section_name, title, description, order_index, is_free, created_at)
VALUES (1, 5, 'Module 1: Introduction', 'Welcome to the Course', 'Introduction video', 1, true, CURRENT_TIMESTAMP);

INSERT INTO lessons (id, course_id, section_name, title, description, order_index, is_free, created_at)
VALUES (2, 5, 'Module 1: Introduction', 'Setting up your environment', 'Setup guide', 2, false, CURRENT_TIMESTAMP);

-- Insert Videos for Lessons
INSERT INTO videos (lesson_id, video_url, duration_seconds, transcript)
VALUES (1, 'https://www.youtube.com/watch?v=M5QY2_8704o', 300, 'Welcome to the course. We are going to learn a lot of amazing things in this module.');

INSERT INTO videos (lesson_id, video_url, duration_seconds, transcript)
VALUES (2, 'https://www.youtube.com/watch?v=M5QY2_8704o', 600, 'Now let us set up the environment. First, open your terminal and install Node.js.');

-- Insert Quiz for Course 5
INSERT INTO quizzes (id, course_id, lesson_id, title, time_limit_seconds, passing_score)
VALUES (1, 5, 2, 'Environment Setup Quiz', 600, 80);

-- Insert Question for Quiz
INSERT INTO questions (id, quiz_id, question_text, question_type, points, options_json, correct_option_index)
VALUES (1, 1, 'What command installs dependencies in Node.js?', 'MULTIPLE_CHOICE', 10, '["npm run", "npm install", "node install", "npm start"]', 1);
