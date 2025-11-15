package com.FairMatch.FairMatch.service;

import com.FairMatch.FairMatch.dto.LoginRequest;
import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.repository.AuthRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final AuthRepository authRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(AuthRepository authRepo, BCryptPasswordEncoder passwordEncoder) {
        this.authRepo = authRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Auth signin(LoginRequest request) throws BadCredentialsException {
        Optional<Auth> userOpt = authRepo.findByUsername(request.getEmail());

        Auth user = userOpt
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return user;
    }
}
