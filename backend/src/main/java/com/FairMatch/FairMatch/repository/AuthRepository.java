package com.FairMatch.FairMatch.repository;

import com.FairMatch.FairMatch.model.Auth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AuthRepository extends JpaRepository<Auth, UUID> {
    Optional<Auth> findByUsername(String username);
}
