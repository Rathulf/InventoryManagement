package edu.cit.sampan.InventoryManangement.repository;

import edu.cit.sampan.InventoryManangement.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Custom database operations used by AuthController
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}