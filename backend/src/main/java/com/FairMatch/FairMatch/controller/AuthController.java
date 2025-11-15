package com.FairMatch.FairMatch.controller;

import com.FairMatch.FairMatch.dto.LoginRequest;
import com.FairMatch.FairMatch.model.Auth;
import com.FairMatch.FairMatch.service.AuthService;
import com.FairMatch.FairMatch.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/auth")
@Validated
public class AuthController {
    private final JwtService jwtService;
    private final AuthService authService;

    @Autowired
    public AuthController(JwtService jwtService, AuthService authService) {
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Auth user;
        try {
            user = authService.signin(request);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        String token = jwtService.generateToken(user);
        Cookie cookie = jwtService.generateAuthCookie(token);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }
}
