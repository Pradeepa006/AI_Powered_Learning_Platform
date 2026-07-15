package com.platform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "videos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Video {

    @Id
    private Long id; // Same as Lesson ID (One-to-One mapping)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "video_url", nullable = false)
    private String videoUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "subtitles_url")
    private String subtitlesUrl;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(name = "hls_url")
    private String hlsUrl;
}
