package com.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "gamification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Gamification {

    @Id
    private Long id; // Same as User ID

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "xp_points")
    @Builder.Default
    private Integer xpPoints = 0;

    @Column(name = "current_streak")
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "last_login_date")
    private LocalDate lastLoginDate;
}
