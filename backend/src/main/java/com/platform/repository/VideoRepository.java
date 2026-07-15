package com.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.platform.model.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {
}
