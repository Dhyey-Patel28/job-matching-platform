package com.FairMatch.FairMatch.service;

import com.FairMatch.FairMatch.dto.LoginRequest;
import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.repository.AuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private AuthRepository authRepo;
    private BCryptPasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authRepo = mock(AuthRepository.class);
        passwordEncoder = mock(BCryptPasswordEncoder.class);
        authService = new AuthService(authRepo, passwordEncoder);
    }

    @Test
    void signin_successful() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password");

        Auth user = new Auth();
        user.setUsername("user@example.com");
        user.setPassword("hashed");

        when(authRepo.findByUsername("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);

        Auth result = authService.signin(request);

        assertEquals(user, result);
    }

    @Test
    void signin_invalidUsername_throws() {
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@example.com");
        request.setPassword("password");

        when(authRepo.findByUsername("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.signin(request));
    }

    @Test
    void signin_invalidPassword_throws() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong");

        Auth user = new Auth();
        user.setUsername("user@example.com");
        user.setPassword("hashed");

        when(authRepo.findByUsername("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.signin(request));
    }
}

