package com.FairMatch.FairMatch.controller;

import com.FairMatch.FairMatch.dto.LoginRequest;
import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.service.AuthService;
import com.FairMatch.FairMatch.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import jakarta.servlet.http.Cookie;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import com.FairMatch.FairMatch.config.SecurityConfig;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;
    @MockitoBean
    private JwtService jwtService;

    private Auth user;

    @BeforeEach
    void setUp() {
        user = new Auth();
        user.setId(UUID.randomUUID());
        user.setUserId(UUID.randomUUID());
        user.setUsername("user1");
        user.setPassword("hashed");
        user.setRole("USER");
    }

    @Test
    void login_success_setsCookieAndReturnsOk() throws Exception {
        when(authService.signin(any(LoginRequest.class))).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(jwtService.generateAuthCookie("jwt-token")).thenReturn(new Cookie("authToken", "jwt-token"));

        String body = "{\"email\":\"user1\",\"password\":\"password1\"}";
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("authToken"));
    }

    @Test
    void login_genericException_returnsInternalServerError() throws Exception {
        when(authService.signin(any(LoginRequest.class))).thenThrow(new RuntimeException("database error"));

        String body = "{\"email\":\"user1\",\"password\":\"wrong\"}";
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void login_invalidCredentials_returnsUnauthorized() throws Exception {
        when(authService.signin(any(LoginRequest.class))).thenThrow(new BadCredentialsException("bad creds"));

        String body = "{\"email\":\"user1\",\"password\":\"wrong\"}";
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_malformedRequest_returnsBadRequest() throws Exception {
        String badBody = "{\"email\":\"user1\"}";

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(badBody))
                .andExpect(status().isBadRequest());
    }
}
