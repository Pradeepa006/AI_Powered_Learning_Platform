package com.platform.config;

import com.platform.model.*;
import com.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class CurriculumSeeder implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ProfileRepository profileRepository;
        @Autowired
        private GamificationRepository gamificationRepository;
        @Autowired
        private BadgeRepository badgeRepository;
        @Autowired
        private CourseRepository courseRepository;
        @Autowired
        private LessonRepository lessonRepository;
        @Autowired
        private VideoRepository videoRepository;
        @Autowired
        private QuizRepository quizRepository;
        @Autowired
        private QuestionRepository questionRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        @Transactional
        public void run(String... args) {
                User instructor = ensureUser("Dr. Alex Carter", "instructor@platform.com", "password", Role.INSTRUCTOR);
                User student = ensureUser("Jane Doe", "student@platform.com", "password", Role.STUDENT);

                ensureProfile(instructor, "Professor of AI at Stanford",
                                "Alex has been teaching AI, web development, and backend engineering for over a decade.");
                ensureProfile(student, "Aspiring Software Engineer",
                                "I love building websites and coding in Java and JavaScript.");
                ensureGamification(student, 350, 3);

                ensureBadge("First Login", "Logged in for the first time!", "trophy");
                ensureBadge("Streak Master", "Maintained a 7-day learning streak!", "zap");
                ensureBadge("Course Finisher", "Completed your first full course!", "award");
                ensureBadge("Code Explorer", "Successfully executed 5 custom programs in the playground!", "code");
                ensureBadge("Quiz Champion", "Passed a course quiz with 90% or higher!", "brain");

                seedCourse(instructor, new CourseSeed(
                                "Web Foundations: HTML, CSS, and JavaScript",
                                "Build responsive, accessible web experiences from the ground up.",
                                "Learn semantic HTML, modern CSS layout systems, and interactive JavaScript patterns.",
                                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=qz0aGYrrlhU",
                                Difficulty.BEGINNER,
                                "English",
                                79.99,
                                39.99,
                                "Web Development",
                                4.8,
                                List.of(
                                                new LessonSeed("Module 1: Markup Essentials",
                                                                "Semantic HTML and Document Structure",
                                                                "Learn how to structure content for accessibility and search engines.",
                                                                true, 1, "https://www.youtube.com/watch?v=qz0aGYrrlhU",
                                                                950,
                                                                "Semantic HTML helps browsers, screen readers, and search engines understand page structure."),
                                                new LessonSeed("Module 2: Styling Systems",
                                                                "CSS Layouts, Flexbox, and Grid",
                                                                "Use modern CSS to create adaptive layouts that work across screen sizes.",
                                                                false, 2, "https://www.youtube.com/watch?v=yfoY53QXEnI",
                                                                1200,
                                                                "Flexbox and grid separate structure from presentation and make responsive layouts easier."),
                                                new LessonSeed("Module 3: Interaction Layer",
                                                                "JavaScript DOM and Events",
                                                                "Add dynamic behavior with event listeners, state, and browser APIs.",
                                                                false, 3, "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                                                                1500,
                                                                "JavaScript connects user actions to page updates and asynchronous workflows.")),
                                new QuizSeed("Front-End Foundations Checkpoint", 900, 65, 3, List.of(
                                                new QuestionSeed(
                                                                "Which HTML element best describes the primary page content?",
                                                                List.of("<main>", "<aside>", "<footer>", "<span>"), 0,
                                                                10),
                                                new QuestionSeed(
                                                                "Which CSS layout model is best for a two-dimensional page grid?",
                                                                List.of("Float", "Flexbox", "Grid", "Inline-block"), 2,
                                                                10),
                                                new QuestionSeed(
                                                                "Which browser API is commonly used to respond to clicks?",
                                                                List.of("localStorage", "addEventListener",
                                                                                "console.table", "JSON.stringify"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "React & Next.js Product Builder",
                                "Ship production-ready frontend apps with modern React patterns.",
                                "Master components, state, routing, server rendering, and data fetching patterns.",
                                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                                Difficulty.ADVANCED,
                                "English",
                                129.99,
                                79.99,
                                "Web Development",
                                4.9,
                                List.of(
                                                new LessonSeed("Module 1: React Core", "Components, Props, and State",
                                                                "Build reusable interfaces with declarative component trees and local state.",
                                                                true, 1, "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                                                                1800,
                                                                "React components turn UI into composable functions of data and state."),
                                                new LessonSeed("Module 2: Routing Layer",
                                                                "Next.js App Router and Server Components",
                                                                "Design efficient route-based experiences with server and client boundaries.",
                                                                false, 2, "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                                                                1600,
                                                                "Next.js App Router supports nested layouts and server-first rendering strategies."),
                                                new LessonSeed("Module 3: Data Flow", "Fetching Data and Mutations",
                                                                "Connect API endpoints, cache data, and synchronize UI updates.",
                                                                false, 3, "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                                                                1400,
                                                                "Efficient apps fetch, cache, and mutate data without blocking the user.")),
                                new QuizSeed("React & Next.js Review", 900, 70, 3, List.of(
                                                new QuestionSeed(
                                                                "Which React feature is used to manage local UI state?",
                                                                List.of("Props", "State", "Reflex", "Middleware"), 1,
                                                                10),
                                                new QuestionSeed(
                                                                "What is a major benefit of Next.js server components?",
                                                                List.of("More CSS", "Less hydration on the client",
                                                                                "No routing", "No JavaScript ever"),
                                                                1, 10),
                                                new QuestionSeed(
                                                                "Which approach best supports reusable layout shells in Next.js?",
                                                                List.of("Nested layouts", "Inline styles",
                                                                                "Local storage", "Window globals"),
                                                                0, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Python Data Science Career Track",
                                "Learn Python, pandas, and machine learning fundamentals for analytics roles.",
                                "Move from Python syntax to notebook workflows, dataframe operations, and model evaluation basics.",
                                "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=rfscVS0vtbw",
                                Difficulty.INTERMEDIATE,
                                "English",
                                109.99,
                                59.99,
                                "Data Science",
                                4.7,
                                List.of(
                                                new LessonSeed("Module 1: Python Syntax",
                                                                "Python Variables and Control Flow",
                                                                "Work through loops, branches, functions, and common data structures.",
                                                                true, 1, "https://www.youtube.com/watch?v=rfscVS0vtbw",
                                                                1700,
                                                                "Python is concise, readable, and well suited to rapid data exploration."),
                                                new LessonSeed("Module 2: Data Handling",
                                                                "Pandas DataFrames and Cleaning",
                                                                "Load, transform, and prepare tabular data for analysis.",
                                                                false, 2, "https://www.youtube.com/watch?v=rfscVS0vtbw",
                                                                1600,
                                                                "DataFrames provide labeled tabular operations for data wrangling."),
                                                new LessonSeed("Module 3: Model Thinking", "Intro to Machine Learning",
                                                                "Understand training, validation, and how to interpret model performance.",
                                                                false, 3, "https://www.youtube.com/watch?v=aircAruvnKk",
                                                                2100,
                                                                "A machine learning model learns patterns from data and generalizes to unseen examples.")),
                                new QuizSeed("Python Data Science Checkpoint", 900, 70, 3, List.of(
                                                new QuestionSeed("Which Python collection is immutable?",
                                                                List.of("List", "Dictionary", "Tuple", "Set"), 2, 10),
                                                new QuestionSeed(
                                                                "What library is most associated with tabular data analysis?",
                                                                List.of("pandas", "pygame", "flask", "pytest"), 0, 10),
                                                new QuestionSeed("What is the primary goal of supervised learning?",
                                                                List.of("Compress images",
                                                                                "Predict outputs from labeled examples",
                                                                                "Write HTML", "Sort integers only"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Java Backend Engineering with Spring Boot",
                                "Build secure APIs, business services, and data layers in Java.",
                                "This backend curriculum covers Java fundamentals, Spring Boot REST APIs, JPA persistence, and payment-ready service design.",
                                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=grEKMHGYyns",
                                Difficulty.INTERMEDIATE,
                                "English",
                                119.99,
                                69.99,
                                "Backend Engineering",
                                4.6,
                                List.of(
                                                new LessonSeed("Module 1: Java Core", "Object-Oriented Java Essentials",
                                                                "Learn classes, objects, inheritance, and core language features.",
                                                                true, 1, "https://www.youtube.com/watch?v=grEKMHGYyns",
                                                                1800,
                                                                "Java remains a strong choice for enterprise services, APIs, and backend systems."),
                                                new LessonSeed("Module 2: Spring Boot",
                                                                "REST APIs and Dependency Injection",
                                                                "Design service layers, controllers, and clean request handling flows.",
                                                                false, 2, "https://www.youtube.com/watch?v=grEKMHGYyns",
                                                                1900,
                                                                "Spring Boot uses dependency injection to compose layered applications."),
                                                new LessonSeed("Module 3: Payments & Persistence",
                                                                "JPA Repositories and Checkout Workflows",
                                                                "Connect the database, store transactions, and process course purchases.",
                                                                false, 3, "https://www.youtube.com/watch?v=grEKMHGYyns",
                                                                1700,
                                                                "Persistence, transactions, and payment orchestration are core backend responsibilities.")),
                                new QuizSeed("Spring Boot Backend Review", 900, 70, 3, List.of(
                                                new QuestionSeed(
                                                                "Which annotation typically marks a REST controller in Spring Boot?",
                                                                List.of("@Entity", "@RestController", "@Service",
                                                                                "@Repository"),
                                                                1, 10),
                                                new QuestionSeed("What does JPA primarily manage?",
                                                                List.of("UI rendering", "Database persistence",
                                                                                "Video streaming", "Routing"),
                                                                1, 10),
                                                new QuestionSeed(
                                                                "Which pattern is ideal for isolating payment logic from controllers?",
                                                                List.of("Service layer", "Inline script",
                                                                                "Random polling", "CSS module"),
                                                                0, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "AI & Machine Learning Essentials",
                                "Understand modern AI, model training, and inference workflows.",
                                "Explore neural networks, model evaluation, embeddings, and prompt-driven experiences.",
                                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=aircAruvnKk",
                                Difficulty.INTERMEDIATE,
                                "English",
                                139.99,
                                89.99,
                                "AI",
                                4.9,
                                List.of(
                                                new LessonSeed("Module 1: AI Foundations", "How Neural Networks Learn",
                                                                "Trace the basic layers, weights, and activation patterns of deep learning.",
                                                                true, 1, "https://www.youtube.com/watch?v=aircAruvnKk",
                                                                1900,
                                                                "Neural networks learn by repeatedly adjusting weights during training."),
                                                new LessonSeed("Module 2: Model Quality",
                                                                "Training, Validation, and Overfitting",
                                                                "Measure model quality and avoid the traps of memorization.",
                                                                false, 2, "https://www.youtube.com/watch?v=aircAruvnKk",
                                                                1600,
                                                                "A good model generalizes well beyond the data it saw during training."),
                                                new LessonSeed("Module 3: AI Product Design",
                                                                "Building Tutor and Recommendation Flows",
                                                                "Wrap model outputs into real product experiences with guardrails.",
                                                                false, 3, "https://www.youtube.com/watch?v=aircAruvnKk",
                                                                1500,
                                                                "AI products require both model quality and thoughtful UX guardrails.")),
                                new QuizSeed("AI Literacy Checkpoint", 900, 70, 3, List.of(
                                                new QuestionSeed("What is an activation function used for?",
                                                                List.of("Storing files", "Adding non-linearity",
                                                                                "Loading images", "Rendering CSS"),
                                                                1, 10),
                                                new QuestionSeed("Why do we use a validation set?",
                                                                List.of("To speed up typing",
                                                                                "To estimate model generalization",
                                                                                "To replace the database",
                                                                                "To avoid JavaScript"),
                                                                1, 10),
                                                new QuestionSeed("What is a key risk of overfitting?",
                                                                List.of("Better test accuracy",
                                                                                "Poor performance on unseen data",
                                                                                "Lower GPU usage", "Faster deployment"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "DevOps Essentials: CI/CD with Docker & Jenkins",
                                "Automate your build, test, and deployment pipelines.",
                                "This free course provides a foundational understanding of DevOps principles, focusing on Continuous Integration and Continuous Deployment (CI/CD) using industry-standard tools like Docker and Jenkins.",
                                "https://images.unsplash.com/photo-1605745341112-85d54cfb0c16?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=F3QpgXBtA7s",
                                Difficulty.BEGINNER,
                                "English",
                                0.0,
                                0.0,
                                "DevOps",
                                4.8,
                                List.of(
                                                new LessonSeed("Module 1: DevOps Culture", "Introduction to DevOps",
                                                                "Understand the philosophy of collaboration and automation that drives DevOps.",
                                                                true, 1, "https://www.youtube.com/watch?v=F3QpgXBtA7s",
                                                                1200,
                                                                "DevOps is a set of practices that combines software development and IT operations."),
                                                new LessonSeed("Module 2: Containerization",
                                                                "Getting Started with Docker",
                                                                "Learn to package applications into isolated containers with Docker.",
                                                                true, 2, "https://www.youtube.com/watch?v=F3QpgXBtA7s",
                                                                1800,
                                                                "Docker makes it easy to build, ship, and run distributed applications."),
                                                new LessonSeed("Module 3: Automation", "Building a Jenkins Pipeline",
                                                                "Create a simple CI/CD pipeline to automate your build and test process.",
                                                                true, 3, "https://www.youtube.com/watch?v=F3QpgXBtA7s",
                                                                2000,
                                                                "Jenkins is an open-source automation server that helps automate the parts of software development related to building, testing, and deploying.")),
                                new QuizSeed("DevOps Fundamentals Quiz", 600, 70, 2, List.of(
                                                new QuestionSeed("What is the primary goal of CI/CD?",
                                                                List.of("To write more code",
                                                                                "To automate software delivery",
                                                                                "To design databases",
                                                                                "To manage servers manually"),
                                                                1, 10),
                                                new QuestionSeed(
                                                                "What does Docker produce?", List.of("Virtual Machines",
                                                                                "Containers", "Servers", "APIs"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Cloud Computing with AWS",
                                "Learn to deploy scalable applications on Amazon Web Services.",
                                "This free introductory course covers core AWS services like EC2, S3, and IAM. You will learn to host a simple web application and understand cloud architecture principles.",
                                "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=k1RI5locgLw",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Cloud", 4.7,
                                List.of(new LessonSeed("Module 1: Cloud Intro", "What is Cloud Computing?",
                                                "Understand the benefits of cloud services.", true, 1,
                                                "https://www.youtube.com/watch?v=k1RI5locgLw", 1100,
                                                "Cloud computing provides on-demand computing services.")),
                                new QuizSeed("AWS Intro Quiz", 300, 70, 1, List.of(
                                                new QuestionSeed("What does EC2 stand for?",
                                                                List.of("Elastic Cloud Computing",
                                                                                "Elastic Compute Cloud",
                                                                                "E-Commerce Cloud",
                                                                                "External Compute Center"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Cybersecurity Fundamentals",
                                "Protect systems and data from digital attacks.",
                                "A free overview of cybersecurity concepts including network security, cryptography, and ethical hacking principles. Learn to identify common vulnerabilities and defense strategies.",
                                "https://images.unsplash.com/photo-1544890225-2f3faec4cd60?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=inWWhr5tnEA",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Security", 4.8,
                                List.of(new LessonSeed("Module 1: Threat Landscape", "Common Cyber Threats",
                                                "Learn about malware, phishing, and DDoS attacks.", true, 1,
                                                "https://www.youtube.com/watch?v=inWWhr5tnEA", 1300,
                                                "Understanding threats is the first step to defense.")),
                                new QuizSeed("Security 101 Quiz", 400, 60, 1, List.of(
                                                new QuestionSeed("What is phishing?",
                                                                List.of("A type of fishing",
                                                                                "A fraudulent attempt to obtain sensitive information",
                                                                                "A server hardware component",
                                                                                "A network protocol"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Introduction to SQL Databases",
                                "Learn the language of data with SQL.",
                                "This free course teaches you how to write SQL queries to manage and retrieve data from relational databases like PostgreSQL and MySQL. Covers SELECT, JOIN, and basic data modeling.",
                                "https://images.unsplash.com/photo-1573495782731-5399f3d089a9?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=HXV3zeQKqGY",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Data Science", 4.9,
                                List.of(new LessonSeed("Module 1: Querying Data", "The SELECT Statement",
                                                "Learn to retrieve data from tables.", true, 1,
                                                "https://www.youtube.com/watch?v=HXV3zeQKqGY", 1500,
                                                "The SELECT statement is the most common SQL command.")),
                                new QuizSeed("SQL Basics Quiz", 500, 70, 1, List.of(
                                                new QuestionSeed(
                                                                "Which keyword is used to combine rows from two or more tables?",
                                                                List.of("COMBINE", "MERGE", "JOIN", "ATTACH"), 2,
                                                                10)))));

                seedCourse(instructor, new CourseSeed(
                                "UI/UX Design Principles",
                                "Create intuitive and beautiful user interfaces.",
                                "A free introduction to the core principles of User Interface (UI) and User Experience (UX) design. Learn about wireframing, prototyping, and user-centered design.",
                                "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=cKZEgtadwlg",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Design", 4.8,
                                List.of(new LessonSeed("Module 1: Design Thinking", "What is User-Centered Design?",
                                                "Focus on user needs to build better products.", true, 1,
                                                "https://www.youtube.com/watch?v=cKZEgtadwlg", 1400,
                                                "Good design solves user problems effectively.")),
                                new QuizSeed("UI/UX Intro Quiz", 400, 70, 1, List.of(
                                                new QuestionSeed("What is a wireframe?",
                                                                List.of("A high-fidelity visual design",
                                                                                "A low-fidelity structural layout",
                                                                                "A final product", "A user survey"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Git & GitHub for Beginners",
                                "Master version control for collaborative projects.",
                                "This free course covers the essentials of Git and GitHub. Learn to create repositories, commit changes, create branches, and collaborate with others on code.",
                                "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=RGOj5yH7evk",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Programming", 4.9,
                                List.of(new LessonSeed("Module 1: Version Control", "Your First Commit",
                                                "Learn to track changes in your project.", true, 1,
                                                "https://www.youtube.com/watch?v=RGOj5yH7evk", 1000,
                                                "Git allows you to save snapshots of your code.")),
                                new QuizSeed("Git Basics Quiz", 300, 80, 1, List.of(
                                                new QuestionSeed(
                                                                "Which command saves your changes to the local repository?",
                                                                List.of("git push", "git commit", "git add",
                                                                                "git save"),
                                                                1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Mobile App Development with Flutter",
                                "Build beautiful native apps from a single codebase.",
                                "A free introduction to Flutter and Dart for building cross-platform mobile apps. Learn about widgets, state management, and building a simple user interface.",
                                "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=pTJJsmejUOQ",
                                Difficulty.INTERMEDIATE, "English", 0.0, 0.0, "Mobile", 4.7,
                                List.of(new LessonSeed("Module 1: Flutter Basics", "Introduction to Widgets",
                                                "Understand that everything in Flutter is a widget.", true, 1,
                                                "https://www.youtube.com/watch?v=pTJJsmejUOQ", 1600,
                                                "Flutter's UI is built using a tree of widgets.")),
                                new QuizSeed("Flutter Intro Quiz", 500, 70, 1, List.of(
                                                new QuestionSeed("What programming language does Flutter use?",
                                                                List.of("JavaScript", "Kotlin", "Swift", "Dart"), 3,
                                                                10)))));

                seedCourse(instructor, new CourseSeed(
                                "Agile & Scrum Project Management",
                                "Deliver projects faster and more efficiently.",
                                "This free course introduces Agile methodologies and the Scrum framework. Learn about sprints, user stories, and the roles of a Scrum team to improve project delivery.",
                                "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=s97-jodvtpg",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Business", 4.6,
                                List.of(new LessonSeed("Module 1: Agile Principles", "The Agile Manifesto",
                                                "Learn the core values of Agile development.", true, 1,
                                                "https://www.youtube.com/watch?v=s97-jodvtpg", 900,
                                                "Agile values individuals and interactions over processes and tools.")),
                                new QuizSeed("Agile Basics Quiz", 300, 70, 1, List.of(
                                                new QuestionSeed("What is a short, time-boxed period in Scrum called?",
                                                                List.of("A Meeting", "A Phase", "A Sprint", "A Cycle"),
                                                                2, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Introduction to C++ Programming",
                                "Learn a powerful, high-performance language.",
                                "A free beginner's course on C++. Covers basic syntax, data types, control structures, and an introduction to object-oriented programming concepts.",
                                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
                                Difficulty.INTERMEDIATE, "English", 0.0, 0.0, "Programming", 4.7,
                                List.of(new LessonSeed("Module 1: C++ Basics", "Variables and Data Types",
                                                "Learn how to store and manipulate data in C++.", true, 1,
                                                "https://www.youtube.com/watch?v=vLnPwxZdW4Y", 1800,
                                                "C++ is a statically-typed language.")),
                                new QuizSeed("C++ Basics Quiz", 600, 65, 1, List.of(
                                                new QuestionSeed("Which symbol is used to create a pointer in C++?",
                                                                List.of("&", "*", "#", "@"), 1, 10)))));

                seedCourse(instructor, new CourseSeed(
                                "Digital Marketing 101",
                                "Grow your online presence and reach customers.",
                                "This free course covers the fundamentals of digital marketing, including SEO (Search Engine Optimization), content marketing, and social media strategy.",
                                "https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&auto=format&fit=crop",
                                "https://www.youtube.com/watch?v=nU-IIXBWlS4",
                                Difficulty.BEGINNER, "English", 0.0, 0.0, "Business", 4.5,
                                List.of(new LessonSeed("Module 1: SEO Basics", "How Search Engines Work",
                                                "Learn how to rank higher on Google.", true, 1,
                                                "https://www.youtube.com/watch?v=nU-IIXBWlS4", 1200,
                                                "SEO is about making your website more visible to search engines.")),
                                new QuizSeed("Marketing Quiz", 400, 70, 1, List.of(
                                                new QuestionSeed("What does SEO stand for?",
                                                                List.of("Social Engagement Optimization",
                                                                                "Search Engine Optimization",
                                                                                "Site Engine Operations",
                                                                                "Sales Enablement Office"),
                                                                1, 10)))));
        }

        private void seedCourse(User instructor, CourseSeed seed) {
                Course course = ensureCourse(instructor, seed);
                for (LessonSeed lessonSeed : seed.lessons()) {
                        Lesson lesson = ensureLesson(course, lessonSeed);
                        ensureVideo(lesson, lessonSeed.videoUrl(), lessonSeed.durationSeconds(),
                                        lessonSeed.transcript());
                }

                Lesson quizLesson = lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId()).stream()
                                .filter(lesson -> lesson.getOrderIndex().equals(seed.quiz().lessonOrderIndex()))
                                .findFirst()
                                .orElse(null);
                Quiz quiz = ensureQuiz(course, quizLesson, seed.quiz());
                for (QuestionSeed questionSeed : seed.quiz().questions()) {
                        ensureQuestion(quiz, questionSeed);
                }
        }

        private User ensureUser(String name, String email, String rawPassword, Role role) {
                return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                                .name(name)
                                .email(email)
                                .password(passwordEncoder.encode(rawPassword))
                                .role(role)
                                .emailVerified(true)
                                .build()));
        }

        private Profile ensureProfile(User user, String title, String bio) {
                return profileRepository.findAll().stream()
                                .filter(profile -> profile.getUser() != null
                                                && profile.getUser().getId().equals(user.getId()))
                                .findFirst()
                                .orElseGet(() -> profileRepository
                                                .save(Profile.builder().user(user).title(title).bio(bio).build()));
        }

        private Gamification ensureGamification(User user, int xpPoints, int currentStreak) {
                return gamificationRepository.findAll().stream()
                                .filter(gamification -> gamification.getUser() != null
                                                && gamification.getUser().getId().equals(user.getId()))
                                .findFirst()
                                .orElseGet(() -> gamificationRepository.save(Gamification.builder()
                                                .user(user)
                                                .xpPoints(xpPoints)
                                                .currentStreak(currentStreak)
                                                .lastLoginDate(LocalDate.now())
                                                .build()));
        }

        private Badge ensureBadge(String name, String description, String iconUrl) {
                return badgeRepository.findByName(name).orElseGet(() -> badgeRepository.save(Badge.builder()
                                .name(name)
                                .description(description)
                                .iconUrl(iconUrl)
                                .build()));
        }

        private Course ensureCourse(User instructor, CourseSeed seed) {
                return courseRepository.findAll().stream()
                                .filter(course -> seed.title().equals(course.getTitle()))
                                .findFirst()
                                .orElseGet(() -> courseRepository.save(Course.builder()
                                                .title(seed.title())
                                                .subtitle(seed.subtitle())
                                                .description(seed.description())
                                                .thumbnailUrl(seed.thumbnailUrl())
                                                .previewVideoUrl(seed.previewVideoUrl())
                                                .difficulty(seed.difficulty())
                                                .language(seed.language())
                                                .price(seed.price())
                                                .discountPrice(seed.discountPrice())
                                                .instructor(instructor)
                                                .category(seed.category())
                                                .averageRating(seed.averageRating())
                                                .status("PUBLISHED")
                                                .build()));
        }

        private Lesson ensureLesson(Course course, LessonSeed seed) {
                return lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId()).stream()
                                .filter(lesson -> seed.title().equals(lesson.getTitle()))
                                .findFirst()
                                .orElseGet(() -> lessonRepository.save(Lesson.builder()
                                                .course(course)
                                                .sectionName(seed.sectionName())
                                                .title(seed.title())
                                                .description(seed.description())
                                                .orderIndex(seed.orderIndex())
                                                .free(seed.free())
                                                .build()));
        }

        private Video ensureVideo(Lesson lesson, String videoUrl, int durationSeconds, String transcript) {
                return videoRepository.findById(lesson.getId()).orElseGet(() -> videoRepository.save(Video.builder()
                                .lesson(lesson)
                                .videoUrl(videoUrl)
                                .durationSeconds(durationSeconds)
                                .transcript(transcript)
                                .build()));
        }

        private Quiz ensureQuiz(Course course, Lesson lesson, QuizSeed seed) {
                return quizRepository.findByCourseId(course.getId()).stream()
                                .filter(quiz -> seed.title().equals(quiz.getTitle()))
                                .findFirst()
                                .orElseGet(() -> quizRepository.save(Quiz.builder()
                                                .course(course)
                                                .lesson(lesson)
                                                .title(seed.title())
                                                .timeLimitSeconds(seed.timeLimitSeconds())
                                                .passingScore(seed.passingScore())
                                                .build()));
        }

        private Question ensureQuestion(Quiz quiz, QuestionSeed seed) {
                return questionRepository.findByQuizId(quiz.getId()).stream()
                                .filter(question -> seed.questionText().equals(question.getQuestionText()))
                                .findFirst()
                                .orElseGet(() -> questionRepository.save(Question.builder()
                                                .quiz(quiz)
                                                .questionText(seed.questionText())
                                                .questionType("MCQ")
                                                .points(seed.points())
                                                .optionsJson(toJsonArray(seed.options()))
                                                .correctOptionIndex(seed.correctOptionIndex())
                                                .build()));
        }

        private String toJsonArray(List<String> values) {
                return values.stream()
                                .map(value -> "\"" + value.replace("\"", "\\\"") + "\"")
                                .collect(Collectors.joining(",", "[", "]"));
        }

        private record CourseSeed(String title, String subtitle, String description, String thumbnailUrl,
                        String previewVideoUrl,
                        Difficulty difficulty, String language, Double price, Double discountPrice, String category,
                        Double averageRating, List<LessonSeed> lessons, QuizSeed quiz) {
        }

        private record LessonSeed(String sectionName, String title, String description, boolean free, int orderIndex,
                        String videoUrl, int durationSeconds, String transcript) {
        }

        private record QuizSeed(String title, Integer timeLimitSeconds, Integer passingScore, int lessonOrderIndex,
                        List<QuestionSeed> questions) {
        }

        private record QuestionSeed(String questionText, List<String> options, int correctOptionIndex, int points) {
        }
}