package com.platform.controller;

import com.platform.dto.AuthResponse;
import com.platform.dto.GoogleCallbackRequest;
import com.platform.dto.LoginRequest;
import com.platform.dto.SignupRequest;
import com.platform.model.Gamification;
import com.platform.model.Profile;
import com.platform.model.Role;
import com.platform.model.User;
import com.platform.repository.GamificationRepository;
import com.platform.repository.ProfileRepository;
import com.platform.repository.UserRepository;
import com.platform.security.CustomUserDetails;
import com.platform.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final GamificationRepository gamificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
            ProfileRepository profileRepository, GamificationRepository gamificationRepository,
            PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.gamificationRepository = gamificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role userRole = Role.STUDENT;
        if (signupRequest.getRole() != null) {
            try {
                userRole = Role.valueOf(signupRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Error: Invalid role specified!");
            }
        }

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(userRole)
                .emailVerified(true) // For local ease, verify automatically
                .build();

        User savedUser = userRepository.save(user);

        // Initialize Profile
        Profile profile = Profile.builder()
                .user(savedUser)
                .bio("Welcome to my profile!")
                .build();
        profileRepository.save(profile);

        // Initialize Gamification
        Gamification gamification = Gamification.builder()
                .user(savedUser)
                .xpPoints(100) // Start with 100 registration bonus XP!
                .currentStreak(1)
                .lastLoginDate(LocalDate.now())
                .build();
        gamificationRepository.save(gamification);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);

        // Update login streak if daily login
        User user = userDetails.getUser();
        gamificationRepository.findById(user.getId()).ifPresent(g -> {
            LocalDate today = LocalDate.now();
            if (g.getLastLoginDate() == null) {
                g.setCurrentStreak(1);
            } else if (g.getLastLoginDate().isBefore(today)) {
                if (g.getLastLoginDate().equals(today.minusDays(1))) {
                    g.setCurrentStreak(g.getCurrentStreak() + 1);
                } else if (g.getLastLoginDate().isBefore(today.minusDays(1))) {
                    g.setCurrentStreak(1); // streak reset
                }
                g.setXpPoints(g.getXpPoints() + 10); // 10 XP login bonus
            }
            g.setLastLoginDate(today);
            gamificationRepository.save(g);
        });

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .requiresMfa(false)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        User user = userDetails.getUser();
        // Fetch profile details
        Profile profile = profileRepository.findById(user.getId()).orElse(null);
        Gamification gamification = gamificationRepository.findById(user.getId()).orElse(null);

        return ResponseEntity.ok(new Object() {
            public Long id = user.getId();
            public String name = user.getName();
            public String email = user.getEmail();
            public String role = user.getRole().name();
            public String bio = profile != null ? profile.getBio() : "";
            public String title = profile != null ? profile.getTitle() : "";
            public String githubUrl = profile != null ? profile.getGithubUrl() : "";
            public String linkedinUrl = profile != null ? profile.getLinkedinUrl() : "";
            public String resumeUrl = profile != null ? profile.getResumeUrl() : "";
            public String skills = profile != null ? profile.getSkills() : "";
            public String profilePhoto = user.getProfilePhoto();
            public Integer xpPoints = gamification != null ? gamification.getXpPoints() : 0;
            public Integer currentStreak = gamification != null ? gamification.getCurrentStreak() : 0;
        });
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String code) {
        // Mock verification
        if ("123456".equals(code)) {
            return ResponseEntity.ok("OTP Verified successfully!");
        }
        return ResponseEntity.badRequest().body("Error: Invalid OTP code!");
    }

    /**
     * Google OAuth Callback
     * Called by the Next.js frontend after Google authenticates the user via
     * NextAuth.
     * Finds-or-creates the user in the DB, then issues our own JWT.
     */
    @PostMapping("/google-callback")
    public ResponseEntity<?> googleOAuthCallback(@RequestBody GoogleCallbackRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Error: Email is required from Google OAuth.");
        }

        // 1. Find existing user by email, or create a new one
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // New Google user – create account
            user = User.builder()
                    .name(request.getName() != null ? request.getName() : request.getEmail())
                    .email(request.getEmail())
                    .password(null) // No password for OAuth users
                    .role(Role.STUDENT) // Default role for Google sign-in
                    .emailVerified(true) // Google has verified the email
                    .profilePhoto(request.getPicture())
                    .oauthProvider("GOOGLE")
                    .oauthId(request.getGoogleId())
                    .build();

            User savedUser = userRepository.save(user);

            // Initialize Profile
            Profile profile = Profile.builder()
                    .user(savedUser)
                    .bio("Welcome to my profile!")
                    .build();
            profileRepository.save(profile);

            // Initialize Gamification with signup bonus
            Gamification gamification = Gamification.builder()
                    .user(savedUser)
                    .xpPoints(100)
                    .currentStreak(1)
                    .lastLoginDate(LocalDate.now())
                    .build();
            gamificationRepository.save(gamification);

            user = savedUser;

        } else {
            // Existing user – update OAuth info and profile photo if needed
            if (user.getOauthProvider() == null) {
                user.setOauthProvider("GOOGLE");
                user.setOauthId(request.getGoogleId());
            }
            if (user.getProfilePhoto() == null && request.getPicture() != null) {
                user.setProfilePhoto(request.getPicture());
            }
            user.setEmailVerified(true);
            userRepository.save(user);

            // Update login streak (same logic as regular login)
            final User finalUser = user;
            gamificationRepository.findById(user.getId()).ifPresent(g -> {
                LocalDate today = LocalDate.now();
                if (g.getLastLoginDate() == null) {
                    g.setCurrentStreak(1);
                } else if (g.getLastLoginDate().isBefore(today)) {
                    if (g.getLastLoginDate().equals(today.minusDays(1))) {
                        g.setCurrentStreak(g.getCurrentStreak() + 1);
                    } else {
                        g.setCurrentStreak(1);
                    }
                    g.setXpPoints(g.getXpPoints() + 10);
                }
                g.setLastLoginDate(today);
                gamificationRepository.save(g);
            });
        }

        // 2. Generate our JWT for this user
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwt = jwtUtils.generateToken(userDetails);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .requiresMfa(false)
                .build());
    }
}
