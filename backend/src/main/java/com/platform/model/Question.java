package com.platform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "question_type", nullable = false)
    private String questionType; // MCQ, CODING

    @Builder.Default
    private Integer points = 10;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson; // for MCQ, list of choices e.g. ["A", "B", "C", "D"]

    @Column(name = "correct_option_index")
    private Integer correctOptionIndex; // for MCQ

    @Column(name = "test_cases_json", columnDefinition = "TEXT")
    private String testCasesJson; // for Coding: input/output test cases
}
