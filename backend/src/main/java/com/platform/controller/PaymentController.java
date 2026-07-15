package com.platform.controller;

import com.platform.model.Course;
import com.platform.model.Enrollment;
import com.platform.model.Payment;
import com.platform.model.User;
import com.platform.repository.CourseRepository;
import com.platform.repository.EnrollmentRepository;
import com.platform.repository.PaymentRepository;
import com.platform.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @GetMapping("/history")
    public ResponseEntity<?> getPurchaseHistory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        List<Map<String, Object>> response = payments.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("courseId", p.getCourse() != null ? p.getCourse().getId() : null);
            map.put("courseTitle", p.getCourse() != null ? p.getCourse().getTitle() : "All-Access Pass");
            map.put("amount", p.getAmount());
            map.put("currency", p.getCurrency());
            map.put("status", p.getStatus());
            map.put("provider", p.getProvider());
            map.put("transactionId", p.getTransactionId());
            map.put("createdAt", p.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> body, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long courseId = Long.valueOf(body.get("courseId").toString());
        String provider = (String) body.get("provider"); // STRIPE, RAZORPAY
        String couponCode = (String) body.get("couponCode");
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User student = userDetails.getUser();

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already enrolled in this course."));
        }

        double originalPrice = course.getDiscountPrice() != null ? course.getDiscountPrice() : course.getPrice();
        double finalPrice = originalPrice;
        
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            couponCode = couponCode.trim().toUpperCase();
            if (couponCode.equals("LUMINA50")) {
                finalPrice = originalPrice * 0.5;
            } else if (couponCode.equals("FREEPASS")) {
                finalPrice = 0.0;
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid coupon code."));
            }
        }

        // Simulate checkout session creation or execute directly
        String txId = "ch_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        
        Payment payment = Payment.builder()
                .user(student)
                .course(course)
                .amount(finalPrice)
                .currency("USD")
                .provider(provider != null ? provider : "STRIPE")
                .transactionId(txId)
                .status("SUCCESS") // Automatically mark as SUCCESS for simulation ease
                .build();

        paymentRepository.save(payment);

        // Auto enroll on success
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(0.0)
                .build();
        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok(Map.of(
                "checkoutUrl", "https://checkout.stripe.com/pay/mock_session",
                "transactionId", txId,
                "status", "SUCCESS",
                "message", "Payment processed successfully (Simulated sandbox).",
                "amount", finalPrice,
                "discountApplied", finalPrice != originalPrice
        ));
    }
}

