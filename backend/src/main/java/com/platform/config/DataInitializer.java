package com.platform.config;

import com.platform.model.Gamification;
import com.platform.model.Profile;
import com.platform.model.Role;
import com.platform.model.User;
import com.platform.repository.GamificationRepository;
import com.platform.repository.ProfileRepository;
import com.platform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final GamificationRepository gamificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProfileRepository profileRepository,
            GamificationRepository gamificationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.gamificationRepository = gamificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create a dummy admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@test.com")) {
            User adminUser = User.builder()
                    .name("Admin User")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("password")) // Simple password for local dev
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .build();

            User savedUser = userRepository.save(adminUser);

            initializeRelatedEntities(savedUser, "Default admin user profile.");
        }

        // Create a dummy instructor user if it doesn't exist
        if (!userRepository.existsByEmail("instructor@platform.com")) {
            User instructorUser = User.builder()
                    .name("Instructor User")
                    .email("instructor@platform.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.INSTRUCTOR)
                    .emailVerified(true)
                    .build();

            User savedUser = userRepository.save(instructorUser);
            initializeRelatedEntities(savedUser, "Default instructor user profile.");
        }

        // Create a dummy student user if it doesn't exist
        if (!userRepository.existsByEmail("student@platform.com")) {
            User studentUser = User.builder()
                    .name("Student User")
                    .email("student@platform.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.STUDENT)
                    .emailVerified(true)
                    .build();

            User savedUser = userRepository.save(studentUser);
            initializeRelatedEntities(savedUser, "Default student user profile.");
        }
    }

    private void initializeRelatedEntities(User user, String bio) {
        // Initialize Profile
        Profile profile = Profile.builder()
                .user(user)
                .bio(bio)
                .build();
        profileRepository.save(profile);

        // Initialize Gamification
        Gamification gamification = Gamification.builder()
                .user(user)
                .xpPoints(0).currentStreak(0)
                .lastLoginDate(LocalDate.now()).build();
        gamificationRepository.save(gamification);
    }
}