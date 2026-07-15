package com.platform.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.model.*;
import com.platform.repository.*;
import com.platform.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    // Public Course search & list
    @GetMapping("/public/search")
    public ResponseEntity<?> searchCourses(@RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        List<Course> courses;
        if (query != null && !query.trim().isEmpty()) {
            courses = courseRepository.searchCourses(query);
        } else if (category != null && !category.trim().isEmpty()) {
            courses = courseRepository.findByCategory(category);
        } else {
            courses = courseRepository.findByStatus("PUBLISHED");
        }
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<?> getMyEnrollments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());

        List<Map<String, Object>> response = enrollments.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("courseId", e.getCourse().getId());
            map.put("title", e.getCourse().getTitle());
            map.put("thumbnailUrl", e.getCourse().getThumbnailUrl());
            map.put("instructor", e.getCourse().getInstructor().getName());
            map.put("progressPercentage", e.getProgressPercentage());
            map.put("isCompleted", e.getCompletedAt() != null);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getCourseDetailsPublic(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(id);
        List<Quiz> quizzes = quizRepository.findByCourseId(id);

        Map<String, Object> response = new HashMap<>();
        response.put("course", course);
        response.put("isEnrolled", false); // Explicitly set for public view
        response.put("curriculum", lessons.stream().map(l -> {
            Map<String, Object> lessonMap = new HashMap<>();
            lessonMap.put("id", l.getId());
            lessonMap.put("title", l.getTitle());
            lessonMap.put("sectionName", l.getSectionName());
            lessonMap.put("isFree", l.isFree());
            lessonMap.put("orderIndex", l.getOrderIndex());
            return lessonMap;
        }).collect(Collectors.toList()));
        response.put("quizzes", quizzes.stream().map(this::buildQuizSummary).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    // Authenticated Course Curriculum (includes videos if enrolled)
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseDetailsAuthenticated(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User user = userDetails.getUser();

        boolean isEnrolled = enrollmentRepository.existsByStudentIdAndCourseId(user.getId(), id)
                || course.getInstructor().getId().equals(user.getId())
                || user.getRole() == Role.ADMIN
                || user.getRole() == Role.SUPER_ADMIN;

        // If user is not enrolled, return the public view of the course
        if (!isEnrolled) {
            return getCourseDetailsPublic(id);
        }

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(id);
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(user.getId(), id).orElse(null);
        List<Quiz> quizzes = quizRepository.findByCourseId(id);

        List<Map<String, Object>> curriculum = lessons.stream().map(l -> {
            Map<String, Object> lessonMap = new HashMap<>();
            lessonMap.put("id", l.getId());
            lessonMap.put("title", l.getTitle());
            lessonMap.put("sectionName", l.getSectionName());
            lessonMap.put("isFree", l.isFree());
            lessonMap.put("orderIndex", l.getOrderIndex());

            if (isEnrolled || l.isFree()) {
                Video video = videoRepository.findById(l.getId()).orElse(null);
                if (video != null) {
                    lessonMap.put("videoUrl", video.getVideoUrl());
                    lessonMap.put("duration", video.getDurationSeconds());
                    lessonMap.put("transcript", video.getTranscript());
                    lessonMap.put("hlsUrl", video.getHlsUrl());
                }

                if (enrollment != null) {
                    LessonProgress progress = lessonProgressRepository
                            .findByEnrollmentIdAndLessonId(enrollment.getId(), l.getId()).orElse(null);
                    lessonMap.put("isCompleted", progress != null && progress.isCompleted());
                    lessonMap.put("watchTime", progress != null ? progress.getWatchTimeSeconds() : 0);
                }
            }
            return lessonMap;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("course", course);
        response.put("isEnrolled", isEnrolled);
        response.put("progress", enrollment != null ? enrollment.getProgressPercentage() : 0);
        response.put("curriculum", curriculum);
        response.put("quizzes", quizzes.stream().map(this::buildQuizDetail).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    // Enroll in a free course directly or simulate paid purchase enrollment
    @PostMapping("/{id}/enroll")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User student = userDetails.getUser();

        if (course.getPrice() != null && course.getPrice() > 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "This is a premium course. Please purchase to enroll."));
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You are already enrolled in this course."));
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0.0)
                .build();
        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok("Successfully enrolled in course: " + course.getTitle());
    }

    // Update lesson watch progress
    @PostMapping("/progress/{lessonId}")
    public ResponseEntity<?> updateProgress(@PathVariable Long lessonId,
            @RequestParam Integer watchTime,
            @RequestParam boolean completed,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(user.getId(), lesson.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course"));

        LessonProgress progress = lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .build());

        progress.setWatchTimeSeconds(watchTime);
        progress.setCompleted(completed);
        lessonProgressRepository.save(progress);

        // Recompute course total progress
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByOrderIndexAsc(lesson.getCourse().getId());
        int totalLessons = lessons.size();
        if (totalLessons > 0) {
            long completedLessons = lessons.stream().filter(l -> {
                LessonProgress lp = lessonProgressRepository
                        .findByEnrollmentIdAndLessonId(enrollment.getId(), l.getId()).orElse(null);
                return lp != null && lp.isCompleted();
            }).count();
            double progressPct = ((double) completedLessons / totalLessons) * 100.0;
            enrollment.setProgressPercentage(progressPct);
            if (progressPct >= 100.0 && enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            enrollmentRepository.save(enrollment);
        }

        return ResponseEntity.ok(Map.of("progressPercentage", enrollment.getProgressPercentage()));
    }

    // Instructor Creation of Courses
    @PostMapping("/create")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Course courseDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User instructor = userDetails.getUser();

        Course course = Course.builder()
                .title(courseDto.getTitle())
                .subtitle(courseDto.getSubtitle())
                .description(courseDto.getDescription())
                .price(courseDto.getPrice())
                .discountPrice(courseDto.getDiscountPrice())
                .difficulty(courseDto.getDifficulty() != null ? courseDto.getDifficulty() : Difficulty.BEGINNER)
                .language(courseDto.getLanguage() != null ? courseDto.getLanguage() : "English")
                .category(courseDto.getCategory() != null ? courseDto.getCategory() : "Programming")
                .thumbnailUrl(courseDto.getThumbnailUrl())
                .previewVideoUrl(courseDto.getPreviewVideoUrl())
                .instructor(instructor)
                .status("PUBLISHED") // Set to published immediately for easy testing
                .build();

        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{courseId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addLesson(@PathVariable Long courseId, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body("You are not the instructor of this course.");
        }

        String title = (String) body.get("title");
        String sectionName = (String) body.get("sectionName");
        String description = (String) body.get("description");
        Integer orderIndex = (Integer) body.get("orderIndex");
        String videoUrl = (String) body.get("videoUrl");
        Integer duration = (Integer) body.get("duration");

        Lesson lesson = Lesson.builder()
                .course(course)
                .title(title)
                .sectionName(sectionName != null ? sectionName : "General")
                .description(description)
                .orderIndex(orderIndex != null ? orderIndex : 1)
                .free(false)
                .build();
        Lesson savedLesson = lessonRepository.save(lesson);

        if (videoUrl != null && !videoUrl.isEmpty()) {
            Video video = Video.builder()
                    .lesson(savedLesson)
                    .videoUrl(videoUrl)
                    .durationSeconds(duration != null ? duration : 300)
                    .transcript("This is a generated AI transcript for the lesson: " + title)
                    .build();
            videoRepository.save(video);
        }

        return ResponseEntity.ok(savedLesson);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course courseDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(userDetails.getUser().getId()) &&
                userDetails.getUser().getRole() != Role.ADMIN && userDetails.getUser().getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("You are not authorized to update this course.");
        }

        course.setTitle(courseDto.getTitle());
        course.setSubtitle(courseDto.getSubtitle());
        course.setDescription(courseDto.getDescription());
        course.setPrice(courseDto.getPrice());
        course.setDiscountPrice(courseDto.getDiscountPrice());
        course.setDifficulty(courseDto.getDifficulty() != null ? courseDto.getDifficulty() : Difficulty.BEGINNER);
        course.setLanguage(courseDto.getLanguage() != null ? courseDto.getLanguage() : "English");
        course.setCategory(courseDto.getCategory() != null ? courseDto.getCategory() : "Programming");
        if (courseDto.getThumbnailUrl() != null) {
            course.setThumbnailUrl(courseDto.getThumbnailUrl());
        }
        if (courseDto.getPreviewVideoUrl() != null) {
            course.setPreviewVideoUrl(courseDto.getPreviewVideoUrl());
        }
        if (courseDto.getStatus() != null) {
            course.setStatus(courseDto.getStatus());
        }

        Course updated = courseRepository.save(course);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(userDetails.getUser().getId()) &&
                userDetails.getUser().getRole() != Role.ADMIN && userDetails.getUser().getRole() != Role.SUPER_ADMIN) {
            return ResponseEntity.status(403).body("You are not authorized to delete this course.");
        }

        courseRepository.delete(course);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully."));
    }

    @PostMapping("/{courseId}/quizzes")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addQuiz(@PathVariable Long courseId, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body("You are not the instructor of this course.");
        }

        String title = (String) body.get("title");
        Integer timeLimit = (Integer) body.get("timeLimitSeconds");
        Integer passingScore = (Integer) body.get("passingScore");
        Long lessonId = body.get("lessonId") != null ? Long.valueOf(body.get("lessonId").toString()) : null;

        Lesson lesson = null;
        if (lessonId != null) {
            lesson = lessonRepository.findById(lessonId).orElse(null);
        }

        Quiz quiz = Quiz.builder()
                .course(course)
                .lesson(lesson)
                .title(title)
                .timeLimitSeconds(timeLimit != null ? timeLimit : 600)
                .passingScore(passingScore != null ? passingScore : 60)
                .build();

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getCourse().getInstructor().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).body("You are not authorized to manage this quiz.");
        }

        String text = (String) body.get("questionText");
        String type = (String) body.get("questionType");
        Integer points = (Integer) body.get("points");
        String optionsJson = (String) body.get("optionsJson");
        Integer correctIndex = (Integer) body.get("correctOptionIndex");

        Question question = Question.builder()
                .quiz(quiz)
                .questionText(text)
                .questionType(type != null ? type : "MULTIPLE_CHOICE")
                .points(points != null ? points : 10)
                .optionsJson(optionsJson)
                .correctOptionIndex(correctIndex != null ? correctIndex : 0)
                .build();

        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    private Map<String, Object> buildQuizSummary(Quiz quiz) {
        Map<String, Object> quizMap = new HashMap<>();
        quizMap.put("id", quiz.getId());
        quizMap.put("title", quiz.getTitle());
        quizMap.put("passingScore", quiz.getPassingScore());
        quizMap.put("timeLimitSeconds", quiz.getTimeLimitSeconds());
        quizMap.put("questionCount", questionRepository.findByQuizId(quiz.getId()).size());
        if (quiz.getLesson() != null) {
            quizMap.put("lessonId", quiz.getLesson().getId());
        }
        return quizMap;
    }

    private Map<String, Object> buildQuizDetail(Quiz quiz) {
        Map<String, Object> quizMap = buildQuizSummary(quiz);
        quizMap.put("questions", questionRepository.findByQuizId(quiz.getId()).stream().map(question -> {
            Map<String, Object> questionMap = new HashMap<>();
            questionMap.put("id", question.getId());
            questionMap.put("questionText", question.getQuestionText());
            questionMap.put("questionType", question.getQuestionType());
            questionMap.put("points", question.getPoints());
            questionMap.put("options", parseOptions(question.getOptionsJson()));
            return questionMap;
        }).collect(Collectors.toList()));
        return quizMap;
    }

    private List<String> parseOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) {
            return List.of();
        }

        try {
            return new ObjectMapper().readValue(optionsJson, new TypeReference<List<String>>() {
            });
        } catch (Exception ex) {
            return List.of();
        }
    }
}
