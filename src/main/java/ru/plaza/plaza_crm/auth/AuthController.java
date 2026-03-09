package ru.plaza.plaza_crm.auth;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return "User created";
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PatchMapping("/password")
    public ResponseEntity<String> changeOwnPassword(@Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        authService.changeOwnPassword(principal.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @PatchMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> changePasswordById(@PathVariable Long id, @Valid @RequestBody AdminChangePasswordRequest request) {
        authService.changePasswordById(id, request);
        return ResponseEntity.ok("Password changed successfully");
    }
}