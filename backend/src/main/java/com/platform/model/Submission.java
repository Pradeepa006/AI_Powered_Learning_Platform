package com.platform.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "github_repo")
    private String githubRepo;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    private Double grade; // null means ungraded

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText; // Instructor feedback

    @Column(name = "ai_feedback_text", columnDefinition = "TEXT")
    private String aiFeedbackText; // AI feedback
}
