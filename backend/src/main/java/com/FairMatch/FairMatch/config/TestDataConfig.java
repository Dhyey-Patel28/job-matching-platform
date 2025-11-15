package com.FairMatch.FairMatch.config;

import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.repository.AuthRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.UUID;

@Configuration
@Profile("!prod")
public class TestDataConfig {
    @Bean
    CommandLineRunner insertTestData(AuthRepository authRepo, BCryptPasswordEncoder encoder) {
        return args -> {
            if (authRepo.findByUsername("user1").isEmpty()) {
                Auth user = new Auth();
                user.setId(UUID.randomUUID());
                user.setUserId(UUID.randomUUID());
                user.setUsername("user1");
                user.setPassword(encoder.encode("password1"));
                user.setRole("USER");
                authRepo.save(user);
            }
        };
    }
}

