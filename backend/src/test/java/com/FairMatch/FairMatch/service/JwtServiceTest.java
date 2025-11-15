package com.FairMatch.FairMatch.service;

import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import jakarta.servlet.http.Cookie;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class JwtServiceTest {
    private Auth mockUser;
    private JwtUtil jwtUtil;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtUtil = mock(JwtUtil.class);
        jwtService = new JwtService(jwtUtil);

        mockUser = new Auth();
        mockUser.setId(java.util.UUID.randomUUID());
        mockUser.setUserId(java.util.UUID.randomUUID());
        mockUser.setUsername("testuser@example.com");
        mockUser.setPassword("hashedpassword");
        mockUser.setRole("USER");
    }

    @Test
    void testGenerateTokenContainsClaims() {
        when(jwtUtil.generateToken(any(), any()))
            .thenReturn("mocked-jwt-token");

        String token = jwtService.generateToken(mockUser);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testGenerateAuthCookie() {
        String token = "sometoken";
        Cookie cookie = jwtService.generateAuthCookie(token);

        assertNotNull(cookie);
        assertEquals("authToken", cookie.getName());
        assertEquals(token, cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/", cookie.getPath());
        assertEquals(24 * 60 * 60, cookie.getMaxAge());
    }
}

