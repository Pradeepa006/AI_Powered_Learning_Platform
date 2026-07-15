package com.platform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    private Long id; // Same as User ID (One-to-One mapping)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String title; // e.g. "Senior Software Engineer" or "Student at Stanford"

    private String skills; // comma separated or tags

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "resume_url")
    private String resumeUrl;
}
