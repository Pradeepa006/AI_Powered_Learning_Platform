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

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private GamificationRepository gamificationRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

        @Override
        @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already seeded
        }

        // 1. Seed Badges
        Badge badge1 = Badge.builder().name("First Login").description("Logged in for the first time!").iconUrl("trophy").build();
        Badge badge2 = Badge.builder().name("Streak Master").description("Maintained a 7-day learning streak!").iconUrl("zap").build();
        Badge badge3 = Badge.builder().name("Course Finisher").description("Completed your first full course!").iconUrl("award").build();
        Badge badge4 = Badge.builder().name("Code Explorer").description("Successfully executed 5 custom programs in the playground!").iconUrl("code").build();
        badgeRepository.saveAll(List.of(badge1, badge2, badge3, badge4));

        // 2. Seed Users
        User instructor = User.builder()
                .name("Dr. Alex Carter")
                .email("instructor@platform.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.INSTRUCTOR)
                .emailVerified(true)
                .build();
        userRepository.save(instructor);

        Profile instructorProfile = Profile.builder()
                .user(instructor)
                .title("Professor of AI at Stanford")
                .bio("Alex has been teaching AI and Next.js development for over a decade. Author of 'Machine Learning Decoded'.")
                .build();
        profileRepository.save(instructorProfile);

        User student = User.builder()
                .name("Jane Doe")
                .email("student@platform.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(student);

        Profile studentProfile = Profile.builder()
                .user(student)
                .title("Aspiring Software Engineer")
                .bio("I love building websites and coding in Java and JavaScript.")
                .build();
        profileRepository.save(studentProfile);

        Gamification studentGamification = Gamification.builder()
                .user(student)
                .xpPoints(350)
                .currentStreak(3)
                .lastLoginDate(LocalDate.now())
                .build();
        gamificationRepository.save(studentGamification);

        // 3. Seed Course 1: AI
        Course course1 = Course.builder()
                .title("Next-Generation Artificial Intelligence")
                .subtitle("From foundational machine learning to state-of-the-art transformers and LLMs.")
                .description("Dive into deep learning, neural architectures, training cycles, and API integrations. We cover PyTorch, Hugging Face transformers, and fine-tuning OpenAI models from scratch.")
                .thumbnailUrl("https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop")
                .previewVideoUrl("https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4")
                .difficulty(Difficulty.INTERMEDIATE)
                .language("English")
                .price(99.99)
                .discountPrice(49.99)
                .instructor(instructor)
                .category("AI")
                .averageRating(4.8)
                .status("PUBLISHED")
                .build();
        courseRepository.save(course1);

        Lesson lesson1_1 = Lesson.builder()
                .course(course1)
                .sectionName("Module 1: Introduction to Intelligence")
                .title("What is Artificial Intelligence?")
                .description("Learn the core distinctions between symbolic AI and machine learning algorithms.")
                .orderIndex(1)
                .free(true)
                .build();
        lessonRepository.save(lesson1_1);

        Video video1_1 = Video.builder()
                .lesson(lesson1_1)
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
                .durationSeconds(240)
                .transcript("Welcome to this course on AI. Today we will answer what is artificial intelligence. Historically, computing was deterministic. Modern AI relies on probabilistic modeling of multidimensional datasets.")
                .build();
        videoRepository.save(video1_1);

        Lesson lesson1_2 = Lesson.builder()
                .course(course1)
                .sectionName("Module 1: Introduction to Intelligence")
                .title("Supervised vs Unsupervised Learning")
                .description("Understanding datasets, targets, labeling, and objective functions.")
                .orderIndex(2)
                .free(false)
                .build();
        lessonRepository.save(lesson1_2);

        Video video1_2 = Video.builder()
                .lesson(lesson1_2)
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")
                .durationSeconds(360)
                .transcript("In this lesson we contrast supervised learning, where targets are provided, and unsupervised learning, which groups inputs based on dimensional proximity (clustering).")
                .build();
        videoRepository.save(video1_2);

        // 4. Seed Course 2: Next.js
        Course course2 = Course.builder()
                .title("Next.js 15 & React 19 Fullstack Development")
                .subtitle("Master App Router, Server Actions, Suspense, and edge functions.")
                .description("Build production-ready web apps with React Server Components, server-side data fetching, optimized layout pipelines, and Tailwind CSS design styling.")
                .thumbnailUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop")
                .previewVideoUrl("https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4")
                .difficulty(Difficulty.ADVANCED)
                .language("English")
                .price(129.99)
                .discountPrice(79.99)
                .instructor(instructor)
                .category("Web Development")
                .averageRating(4.9)
                .status("PUBLISHED")
                .build();
        courseRepository.save(course2);

        Lesson lesson2_1 = Lesson.builder()
                .course(course2)
                .sectionName("Module 1: Core Framework Architecture")
                .title("React Server Components Explained")
                .description("Analyzing the execution flow, hydration phases, and performance implications of Next.js App Router.")
                .orderIndex(1)
                .free(true)
                .build();
        lessonRepository.save(lesson2_1);

        Video video2_1 = Video.builder()
                .lesson(lesson2_1)
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4")
                .durationSeconds(300)
                .transcript("React Server Components allow code to execute on the server, avoiding client-side hydration for static components, resulting in faster Largest Contentful Paint (LCP).")
                .build();
        videoRepository.save(video2_1);
    }
}
