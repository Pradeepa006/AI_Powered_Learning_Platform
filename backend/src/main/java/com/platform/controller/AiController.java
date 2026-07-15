package com.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.model.ChatHistory;
import com.platform.model.User;
import com.platform.repository.ChatHistoryRepository;
import com.platform.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Value("${app.ai.provider:openai}")
    private String aiProvider;

    @Value("${app.openai.api-key:mock-key-for-local-testing}")
    private String openAiApiKey;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/chat")
    public ResponseEntity<?> getTutorResponse(@RequestBody Map<String, Object> body, @AuthenticationPrincipal CustomUserDetails userDetails) {
        String message = (String) body.get("message");
        String context = (String) body.get("context"); // e.g. Current video transcript
        User user = userDetails != null ? userDetails.getUser() : null;

        // Persist chat history only for authenticated users.
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder().user(user).role("user").content(message).build());
        }

        String aiResponseText;

        if (!isAiConfigured()) {
            aiResponseText = getMockTutorResponse(message, context);
        } else {
            try {
                aiResponseText = callAiChat(message, context, user != null ? user.getName() : "Guest Learner");
            } catch (Exception e) {
                // Fallback to mock on connection error
                aiResponseText = "*(Simulated AI response)* \n\n" + getMockTutorResponse(message, context);
            }
        }

        // Persist chat history only for authenticated users.
        if (user != null) {
            chatHistoryRepository.save(ChatHistory.builder().user(user).role("assistant").content(aiResponseText).build());
        }

        return ResponseEntity.ok(Map.of("response", aiResponseText));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByCreatedAtAsc(userDetails.getUser().getId());
        return ResponseEntity.ok(history);
    }

    @PostMapping("/explain-code")
    public ResponseEntity<?> explainCode(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String explanation;
        if (!isAiConfigured()) {
            explanation = "### Code Explanation\n" +
                    "This code defines a functionality related to your program. Here is the line-by-line review:\n" +
                    "1. **Declaration**: Initiates the block.\n" +
                    "2. **Iteration**: Processes elements inside the scope.\n" +
                    "3. **Return**: Passes result back.\n\n" +
                    "### Time Complexity\n" +
                    "- **Worst Case**: \\(O(N)\\) where \\(N\\) is size of input.\n" +
                    "- **Space Complexity**: \\(O(1)\\) auxiliary memory.\n\n" +
                    "### Optimization Suggestion\n" +
                    "Consider utilizing memoization/caching if this block executes repeatedly with same values.";
        } else {
            try {
                explanation = callAiSimple("Explain the following code in markdown with time/space complexities and optimizations:\n\n" + code);
            } catch (Exception e) {
                explanation = "Error executing AI explanation: " + e.getMessage();
            }
        }
        return ResponseEntity.ok(Map.of("explanation", explanation));
    }

    @PostMapping("/debug-code")
    public ResponseEntity<?> debugCode(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String errors = body.get("error");
        String explanation;
        if (!isAiConfigured()) {
            explanation = "### Bug Identified\n" +
                    "The issue is related to null-pointer dereferencing or boundary errors in inputs.\n\n" +
                    "### Fixed Code\n" +
                    "```javascript\n" +
                    "// Guard condition added\n" +
                    "if (!data || data.length === 0) return null;\n" +
                    code + "\n" +
                    "```\n\n" +
                    "### Why this works\n" +
                    "Ensures data integrity before performing indexed access operations.";
        } else {
            try {
                explanation = callAiSimple("Debug this code. Error is: " + errors + ". Code is:\n\n" + code);
            } catch (Exception e) {
                explanation = "Error executing AI debugger: " + e.getMessage();
            }
        }
        return ResponseEntity.ok(Map.of("solution", explanation));
    }

    @GetMapping("/roadmap")
    public ResponseEntity<?> generateRoadmap(@RequestParam String role) {
        Map<String, Object> roadmap = getMockRoadmap(role);

        if (isAiConfigured()) {
            try {
                String aiResult = callAiSimple("Generate a detailed JSON learning roadmap for role: " + role + ". Output ONLY valid JSON matching this schema: {role: string, timeline: string, steps: [{month: string, topic: string, resources: string, hoursPerWeek: number}], companies: string[], averageSalary: string}");
                Map<String, Object> parsed = parseJsonObject(aiResult);
                if (!parsed.isEmpty()) {
                    roadmap = parsed;
                }
            } catch (Exception ignored) {
                // Keep mock roadmap if external AI call fails.
            }
        }

        return ResponseEntity.ok(roadmap);
    }

    @PostMapping("/resume-score")
    public ResponseEntity<?> scoreResume(@RequestBody Map<String, String> body) {
        String resume = body.get("resume");
        Map<String, Object> analysis = new HashMap<>();

        if (!isAiConfigured()) {
            analysis.put("score", 78);
            analysis.put("keywordsFound", List.of("TypeScript", "React", "PostgreSQL", "APIs", "Git"));
            analysis.put("keywordsMissing", List.of("Redis", "Docker", "AWS S3", "CI/CD", "Spring Security"));
            analysis.put("improvements", List.of(
                    "Include quantifiable impact metrics (e.g., 'Improved database query load time by 30%')",
                    "Add AWS deployment or orchestration details to show DevOps experience",
                    "Format headers standardly to increase parser success rate"
            ));
        } else {
            try {
                String aiResult = callAiSimple("Analyze this resume for tech jobs and return standard JSON containing 'score' (number 0-100), 'keywordsFound' (string array), 'keywordsMissing' (string array), and 'improvements' (string array). Output only raw JSON:\n\n" + resume);
                analysis = parseJsonObject(aiResult);
                if (analysis.isEmpty()) {
                    throw new IllegalArgumentException("AI returned invalid JSON");
                }
            } catch (Exception e) {
                analysis.put("score", 50);
                analysis.put("improvements", List.of("Failed to connect to AI server for parsing: " + e.getMessage()));
            }
        }
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/mock-interview")
    public ResponseEntity<?> processMockInterview(@RequestBody Map<String, Object> body) {
        String role = (String) body.get("role");
        String question = (String) body.get("question");
        String answer = (String) body.get("answer");

        Map<String, Object> feedback = new HashMap<>();
        if (!isAiConfigured()) {
            feedback.put("score", 82);
            feedback.put("grammar", "Excellent clarity. Minimal fillers like 'ahm' or 'like'.");
            feedback.put("speed", "130 WPM (Optimal reading/speaking flow).");
            feedback.put("technicalAccuracy", "Good conceptual alignment. You correctly mentioned state structures and database transaction handling.");
            feedback.put("recommendations", "Elaborate more on design constraints and what trade-offs you took (e.g. CAP theorem compromises in consistency).");
        } else {
            try {
                String aiResult = callAiSimple("Assess this interview answer for a " + role + " role. Question: " + question + ". Answer: " + answer + ". Evaluate grammar, speaking speed estimation, technical accuracy, score (0-100), and recommendations. Output ONLY raw JSON matching: {score: number, grammar: string, speed: string, technicalAccuracy: string, recommendations: string}");
                feedback = parseJsonObject(aiResult);
                if (feedback.isEmpty()) {
                    throw new IllegalArgumentException("AI returned invalid JSON");
                }
            } catch (Exception e) {
                feedback.put("score", 70);
                feedback.put("recommendations", "Review details on: " + role);
            }
        }
        return ResponseEntity.ok(feedback);
    }

    // Helper to request provider-specific AI chat response
    private String callAiChat(String message, String context, String userName) throws Exception {
        if (isGeminiProvider()) {
            String systemPrompt = "You are an expert AI Tutor helping student " + userName + " in this platform. " +
                    (context != null ? "Context: " + context : "");
            return callGemini(systemPrompt + "\n\nUser question: " + message);
        }
        return callOpenAiChat(message, context, userName);
    }

    private String callAiSimple(String prompt) throws Exception {
        if (isGeminiProvider()) {
            return callGemini(prompt);
        }
        return callOpenAiSimple(prompt);
    }

    // Helper to request OpenAI Chat Completions API
    private String callOpenAiChat(String message, String context, String userName) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + openAiApiKey);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an expert AI Tutor helping student " + userName + " in this platform. " + (context != null ? "Context: " + context : "")));
        messages.add(Map.of("role", "user", "content", message));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> choiceMessage = (Map<String, Object>) choices.get(0).get("message");
        return (String) choiceMessage.get("content");
    }

    private String callOpenAiSimple(String prompt) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + openAiApiKey);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", prompt));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> choiceMessage = (Map<String, Object>) choices.get(0).get("message");
        return (String) choiceMessage.get("content");
    }

    private String callGemini(String prompt) {
        String encodedModel = UriUtils.encodePathSegment(geminiModel, StandardCharsets.UTF_8);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodedModel + ":generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("candidates")) {
            throw new IllegalStateException("Gemini response missing candidates");
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no candidates");
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = content != null ? (List<Map<String, Object>>) content.get("parts") : Collections.emptyList();
        if (parts == null || parts.isEmpty()) {
            throw new IllegalStateException("Gemini response missing content parts");
        }

        Object text = parts.get(0).get("text");
        return text != null ? text.toString() : "";
    }

    private boolean isAiConfigured() {
        if (isGeminiProvider()) {
            return geminiApiKey != null && !geminiApiKey.trim().isEmpty();
        }
        return openAiApiKey != null
                && !openAiApiKey.trim().isEmpty()
                && !openAiApiKey.equals("mock-key-for-local-testing");
    }

    private boolean isGeminiProvider() {
        return "gemini".equalsIgnoreCase(aiProvider);
    }

    private Map<String, Object> parseJsonObject(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return new HashMap<>();
        }

        String trimmed = rawText.trim();

        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
        }

        try {
            return objectMapper.readValue(trimmed, Map.class);
        } catch (Exception ignored) {
            // Try to salvage JSON embedded in surrounding text.
            int start = trimmed.indexOf('{');
            int end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                String candidate = trimmed.substring(start, end + 1);
                try {
                    return objectMapper.readValue(candidate, Map.class);
                } catch (Exception ignoredAgain) {
                    return new HashMap<>();
                }
            }
            return new HashMap<>();
        }
    }

    private Map<String, Object> getMockRoadmap(String role) {
        Map<String, Object> roadmap = new HashMap<>();
        roadmap.put("role", role);
        roadmap.put("timeline", "6 Months Study Plan");
        roadmap.put("steps", List.of(
                Map.of("month", "Month 1", "topic", "Foundations of " + role, "resources", "Recommended Course: " + role + " Starter guide, Book: Introduction to Algorithms", "hoursPerWeek", 10),
                Map.of("month", "Month 2", "topic", "Advanced Concept building", "resources", "Advanced Udemy lessons, MDN/Oracle docs", "hoursPerWeek", 12),
                Map.of("month", "Month 3", "topic", "Database integration & APIs", "resources", "PostgreSQL manual, Spring/Express tutorial", "hoursPerWeek", 15),
                Map.of("month", "Month 4-5", "topic", "Real-world Capstone Project build", "resources", "GitHub actions documentation, S3 hosting guides", "hoursPerWeek", 20),
                Map.of("month", "Month 6", "topic", "Interview Preparation & mock runs", "resources", "LeetCode, System Design Primer", "hoursPerWeek", 15)
        ));
        roadmap.put("companies", List.of("Google", "Netflix", "Stripe", "Amazon"));
        roadmap.put("averageSalary", "$95,000 - $130,000");
        return roadmap;
    }

    private String getMockTutorResponse(String message, String context) {
        String lowercaseMsg = message.toLowerCase();
        if (lowercaseMsg.contains("hello") || lowercaseMsg.contains("hi ")) {
            return "Hello! I am your AI Tutor. How can I help you master your coursework today?";
        } else if (lowercaseMsg.contains("explain") || lowercaseMsg.contains("what is")) {
            return "Here is a breakdown of that concept:\n\n" +
                    "1. **Core Idea**: It solves efficiency in processing distributed sets.\n" +
                    "2. **Real-world analogy**: Think of a catalog in a massive library where index cards represent actual book addresses.\n" +
                    "3. **Code Pattern**:\n" +
                    "```java\n" +
                    "// standard caching pattern\n" +
                    "public Object getData(String key) {\n" +
                    "    Object value = redis.get(key);\n" +
                    "    if (value == null) {\n" +
                    "        value = db.query(key);\n" +
                    "        redis.set(key, value);\n" +
                    "    }\n" +
                    "    return value;\n" +
                    "}\n" +
                    "```\n" +
                    "Let me know if you need specific details or a quick quiz on this!";
        } else if (lowercaseMsg.contains("quiz")) {
            return "Here is a quick quiz to check your understanding:\n\n" +
                    "**Question**: Which data structure has average \\(O(1)\\) lookup time?\n" +
                    "- A) Binary Search Tree\n" +
                    "- B) LinkedList\n" +
                    "- C) HashMap\n" +
                    "- D) Sorted Array\n\n" +
                    "Reply with your answer and I will check it!";
        } else if (lowercaseMsg.contains("c") || lowercaseMsg.contains("hashmap")) {
            return "Correct! A **HashMap** uses key hashing to access entries in constant average time \\(O(1)\\). Exceptional work!";
        } else {
            return "That is a great question. When analyzing " + message + ", it is important to divide the system into:\n\n" +
                    "- **Data Access Layer**: Handles raw queries and index caching.\n" +
                    "- **Business Layer**: Enforces transaction bounds.\n" +
                    "- **Representation Layer**: Returns clean, responsive payloads.\n\n" +
                    "Would you like me to elaborate on the engineering trade-offs of this approach?";
        }
    }
}
