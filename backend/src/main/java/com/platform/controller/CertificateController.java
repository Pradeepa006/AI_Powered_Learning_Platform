package com.platform.controller;

import com.platform.model.Certificate;
import com.platform.model.Enrollment;
import com.platform.model.Quiz;
import com.platform.model.QuizAttempt;
import com.platform.repository.CertificateRepository;
import com.platform.repository.EnrollmentRepository;
import com.platform.repository.QuizRepository;
import com.platform.repository.QuizAttemptRepository;
import com.platform.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")
public class CertificateController {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    // Get all certificates earned by the current user
    @GetMapping("/my")
    public ResponseEntity<?> getMyCertificates(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long studentId = userDetails.getUser().getId();
        List<Certificate> certs = certificateRepository.findByStudentId(studentId);
        
        List<Map<String, Object>> response = certs.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("certificateId", c.getCertificateId());
            map.put("courseId", c.getCourse().getId());
            map.put("courseTitle", c.getCourse().getTitle());
            map.put("issueDate", c.getIssueDate());
            map.put("instructorName", c.getCourse().getInstructor().getName());
            map.put("blockchainTxHash", c.getBlockchainTxHash());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Issue certificate if course is completed (100% progress) and requirements are met
    @PostMapping("/generate/{courseId}")
    public ResponseEntity<?> generateCertificate(@PathVariable Long courseId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long studentId = userDetails.getUser().getId();
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment record not found"));

        if (enrollment.getProgressPercentage() < 100.0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Course progress must be 100% to generate a certificate. Current: " + enrollment.getProgressPercentage() + "%"));
        }

        // For Free courses, verify that all quizzes in the course have been successfully passed
        boolean isFree = enrollment.getCourse().getPrice() == null || enrollment.getCourse().getPrice() == 0;
        if (isFree) {
            List<Quiz> quizzes = quizRepository.findByCourseId(courseId);
            for (Quiz quiz : quizzes) {
                List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdAndQuizId(studentId, quiz.getId());
                boolean passedQuiz = attempts.stream().anyMatch(QuizAttempt::isPassed);
                if (!passedQuiz) {
                    return ResponseEntity.badRequest().body(Map.of("message", "You must pass all quizzes to receive a certificate for this free course. You haven't passed: " + quiz.getTitle()));
                }
            }
        }

        // Check if certificate already generated
        Certificate certificate = certificateRepository.findByStudentIdAndCourseId(studentId, courseId).orElse(null);
        if (certificate == null) {
            String certId = "CERT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
            String txHash = "0x" + UUID.randomUUID().toString().replace("-", "").substring(0, 40);

            certificate = Certificate.builder()
                    .certificateId(certId)
                    .student(userDetails.getUser())
                    .course(enrollment.getCourse())
                    .blockchainTxHash(txHash)
                    .build();
            certificateRepository.save(certificate);
        }

        return ResponseEntity.ok(Map.of(
                "certificateId", certificate.getCertificateId(),
                "issueDate", certificate.getIssueDate() != null ? certificate.getIssueDate() : LocalDateTimeNowMock(),
                "blockchainTxHash", certificate.getBlockchainTxHash()
        ));
    }

    // Public certificate verification portal
    @GetMapping("/verify/{certId}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String certId) {
        Certificate cert = certificateRepository.findByCertificateId(certId)
                .orElseThrow(() -> new RuntimeException("Certificate code is invalid or does not exist."));

        Map<String, Object> details = new HashMap<>();
        details.put("certificateId", cert.getCertificateId());
        details.put("studentName", cert.getStudent().getName());
        details.put("courseTitle", cert.getCourse().getTitle());
        details.put("issueDate", cert.getIssueDate());
        details.put("blockchainTxHash", cert.getBlockchainTxHash());
        details.put("verified", true);

        return ResponseEntity.ok(details);
    }

    private String LocalDateTimeNowMock() {
        return java.time.LocalDateTime.now().toString();
    }
}

