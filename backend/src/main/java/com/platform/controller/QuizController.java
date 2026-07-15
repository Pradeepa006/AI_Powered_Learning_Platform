package com.platform.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.model.Question;
import com.platform.model.Quiz;
import com.platform.model.QuizAttempt;
import com.platform.repository.QuestionRepository;
import com.platform.repository.QuizAttemptRepository;
import com.platform.repository.QuizRepository;
import com.platform.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @GetMapping("/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return ResponseEntity.ok(buildQuizPayload(quiz, false));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId,
                                        @RequestBody Map<String, Object> body,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        List<Question> questions = questionRepository.findByQuizId(quizId);

        Map<String, Object> answers = readAnswers(body.get("answers"));
        double totalPoints = 0.0;
        double earnedPoints = 0.0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (Question question : questions) {
            int points = question.getPoints() != null ? question.getPoints() : 10;
            totalPoints += points;

            Integer selectedOptionIndex = readIntegerAnswer(answers.get(String.valueOf(question.getId())));
            boolean correct = selectedOptionIndex != null && selectedOptionIndex.equals(question.getCorrectOptionIndex());
            if (correct) {
                earnedPoints += points;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("questionId", question.getId());
            result.put("correct", correct);
            result.put("selectedOptionIndex", selectedOptionIndex);
            result.put("correctOptionIndex", question.getCorrectOptionIndex());
            result.put("questionText", question.getQuestionText());
            results.add(result);
        }

        double score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100.0 : 0.0;
        boolean passed = score >= (quiz.getPassingScore() != null ? quiz.getPassingScore() : 60);

        QuizAttempt attempt = quizAttemptRepository.save(QuizAttempt.builder()
                .student(userDetails.getUser())
                .quiz(quiz)
                .score(score)
                .passed(passed)
                .build());

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("score", score);
        response.put("passed", passed);
        response.put("passingScore", quiz.getPassingScore());
        response.put("totalQuestions", questions.size());
        response.put("results", results);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildQuizPayload(Quiz quiz, boolean includeAnswers) {
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        List<Map<String, Object>> questionPayloads = new ArrayList<>();

        for (Question question : questions) {
            Map<String, Object> questionPayload = new HashMap<>();
            questionPayload.put("id", question.getId());
            questionPayload.put("questionText", question.getQuestionText());
            questionPayload.put("questionType", question.getQuestionType());
            questionPayload.put("points", question.getPoints());
            questionPayload.put("options", parseOptions(question.getOptionsJson()));
            if (includeAnswers) {
                questionPayload.put("correctOptionIndex", question.getCorrectOptionIndex());
            }
            questionPayloads.add(questionPayload);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", quiz.getId());
        payload.put("title", quiz.getTitle());
        payload.put("timeLimitSeconds", quiz.getTimeLimitSeconds());
        payload.put("passingScore", quiz.getPassingScore());
        payload.put("questions", questionPayloads);
        return payload;
    }

    private Map<String, Object> readAnswers(Object rawAnswers) {
        if (rawAnswers instanceof Map<?, ?> map) {
            Map<String, Object> answers = new HashMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                answers.put(String.valueOf(entry.getKey()), entry.getValue());
            }
            return answers;
        }

        return Map.of();
    }

    private Integer readIntegerAnswer(Object rawAnswer) {
        if (rawAnswer == null) {
            return null;
        }
        if (rawAnswer instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(rawAnswer));
        } catch (NumberFormatException ex) {
            return null;
        }
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