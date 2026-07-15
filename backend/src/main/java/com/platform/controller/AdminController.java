package com.platform.controller;

import com.platform.model.*;
import com.platform.repository.CertificateRepository;
import com.platform.repository.CourseRepository;
import com.platform.repository.EnrollmentRepository;
import com.platform.repository.GamificationRepository;
import com.platform.repository.LessonRepository;
import com.platform.repository.PaymentRepository;
import com.platform.repository.QuizRepository;
import com.platform.repository.UserRepository;
import com.platform.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final CertificateRepository certificateRepository;
    private final LessonRepository lessonRepository;
    private final GamificationRepository gamificationRepository;
    private final QuizRepository quizRepository;

    public AdminController(UserRepository userRepository, CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository, PaymentRepository paymentRepository,
            CertificateRepository certificateRepository, LessonRepository lessonRepository,
            GamificationRepository gamificationRepository, QuizRepository quizRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.paymentRepository = paymentRepository;
        this.certificateRepository = certificateRepository;
        this.lessonRepository = lessonRepository;
        this.gamificationRepository = gamificationRepository;
        this.quizRepository = quizRepository;
    }

    /**
     * Get platform-wide analytics summary.
     * Accessible by ADMIN and SUPER_ADMIN.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long completedEnrollments = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCompletedAt() != null).count();
        long totalCertificates = certificateRepository.count();

        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()) && p.getAmount() != null)
                .mapToDouble(Payment::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCourses", totalCourses);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("completedEnrollments", completedEnrollments);
        stats.put("totalCertificates", totalCertificates);
        stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);

        // Course breakdown
        List<Map<String, Object>> courseStats = courseRepository.findAll().stream().map(course -> {
            Map<String, Object> cs = new HashMap<>();
            cs.put("id", course.getId());
            cs.put("title", course.getTitle());
            cs.put("category", course.getCategory());
            cs.put("price", course.getPrice());
            cs.put("status", course.getStatus());
            cs.put("instructor", course.getInstructor().getName());
            long enrollCount = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getCourse().getId().equals(course.getId())).count();
            cs.put("enrollmentCount", enrollCount);
            double courseRevenue = paymentRepository.findAll().stream()
                    .filter(p -> p.getCourse() != null && p.getCourse().getId().equals(course.getId())
                            && "SUCCESS".equals(p.getStatus()) && p.getAmount() != null)
                    .mapToDouble(Payment::getAmount).sum();
            cs.put("revenue", Math.round(courseRevenue * 100.0) / 100.0);
            return cs;
        }).collect(Collectors.toList());

        stats.put("courseStats", courseStats);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all users for admin management.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(u -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", u.getId());
            userMap.put("name", u.getName());
            userMap.put("email", u.getEmail());
            userMap.put("role", u.getRole());
            Gamification gamification = gamificationRepository.findById(u.getId()).orElse(null);
            userMap.put("xpPoints", gamification != null ? gamification.getXpPoints() : 0);
            userMap.put("currentStreak", gamification != null ? gamification.getCurrentStreak() : 0);
            userMap.put("createdAt", u.getCreatedAt());
            long enrollments = enrollmentRepository.findByStudentId(u.getId()).size();
            userMap.put("enrollmentCount", enrollments);
            return userMap;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Get detailed list of all courses for admin management.
     */
    @GetMapping("/courses")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<?> getAllCoursesAdmin(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Course> courses;
        User user = userDetails.getUser();
        // INSTRUCTOR sees only their own courses, ADMIN sees all
        if (user.getRole() == Role.INSTRUCTOR) {
            courses = courseRepository.findAll().stream()
                    .filter(c -> c.getInstructor().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        } else {
            courses = courseRepository.findAll();
        }

        List<Map<String, Object>> result = courses.stream().map(course -> {
            Map<String, Object> cs = new HashMap<>();
            cs.put("id", course.getId());
            cs.put("title", course.getTitle());
            cs.put("subtitle", course.getSubtitle());
            cs.put("description", course.getDescription());
            cs.put("category", course.getCategory());
            cs.put("price", course.getPrice());
            cs.put("discountPrice", course.getDiscountPrice());
            cs.put("difficulty", course.getDifficulty());
            cs.put("language", course.getLanguage());
            cs.put("status", course.getStatus());
            cs.put("thumbnailUrl", course.getThumbnailUrl());
            cs.put("previewVideoUrl", course.getPreviewVideoUrl());
            cs.put("averageRating", course.getAverageRating());
            cs.put("createdAt", course.getCreatedAt());

            Map<String, Object> instrMap = new HashMap<>();
            instrMap.put("id", course.getInstructor().getId());
            instrMap.put("name", course.getInstructor().getName());
            instrMap.put("email", course.getInstructor().getEmail());
            cs.put("instructor", instrMap);

            long enrollCount = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getCourse().getId().equals(course.getId())).count();
            cs.put("enrollmentCount", enrollCount);

            long lessonCount = lessonRepository.findByCourseIdOrderByOrderIndexAsc(course.getId()).size();
            cs.put("lessonCount", lessonCount);

            long quizCount = quizRepository.findByCourseId(course.getId()).size();
            cs.put("quizCount", quizCount);

            double revenue = paymentRepository.findAll().stream()
                    .filter(p -> p.getCourse() != null && p.getCourse().getId().equals(course.getId())
                            && "SUCCESS".equals(p.getStatus()) && p.getAmount() != null)
                    .mapToDouble(Payment::getAmount).sum();
            cs.put("revenue", Math.round(revenue * 100.0) / 100.0);
            return cs;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Update course status (publish/archive/draft).
     */
    @PutMapping("/courses/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateCourseStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User user = userDetails.getUser();
        if (user.getRole() == Role.INSTRUCTOR && !course.getInstructor().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
        }
        String newStatus = body.get("status");
        if (newStatus != null
                && (newStatus.equals("PUBLISHED") || newStatus.equals("DRAFT") || newStatus.equals("ARCHIVED"))) {
            course.setStatus(newStatus);
            courseRepository.save(course);
        }
        return ResponseEntity.ok(Map.of("message", "Status updated to " + newStatus));
    }
}
