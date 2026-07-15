package com.platform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quizzes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson; // Can be optional (course level or lesson level)

    @Column(nullable = false)
    private String title;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds; // null means no limit

    @Column(name = "passing_score")
    @Builder.Default
    private Integer passingScore = 60; // percentage
}
