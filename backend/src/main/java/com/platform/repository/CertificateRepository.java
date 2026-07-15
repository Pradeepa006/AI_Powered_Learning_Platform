package com.platform.repository;

import com.platform.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudentId(Long studentId);
    Optional<Certificate> findByCertificateId(String certificateId);
    Optional<Certificate> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
