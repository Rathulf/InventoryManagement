package edu.cit.sampan.InventoryManagement.repository;

import edu.cit.sampan.InventoryManagement.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Automatically sorts the logs from newest to oldest
    List<AuditLog> findAllByOrderByTimestampDesc();
}