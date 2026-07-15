package com.platform.repository;

import com.platform.model.Gamification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GamificationRepository extends JpaRepository<Gamification, Long> {
}
