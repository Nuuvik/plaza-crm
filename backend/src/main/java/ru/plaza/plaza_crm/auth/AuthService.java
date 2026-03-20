package ru.plaza.plaza_crm.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        log.info("Registering new user, username={}, role={}", request.getUsername(), request.getRole());

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            log.warn("Username already taken: {}", request.getUsername());
            throw new BadRequestException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        auditService.log("USER", user.getId(), "REGISTER");
    }

    @Transactional
    public String login(LoginRequest request) {
        log.info("Logging user, username={}", request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("User not found: username={}", request.getUsername());
                    return new ResourceNotFoundException("User not found");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Incorrect password for username={}", request.getUsername());
            throw new BadRequestException("Invalid password");
        }

        auditService.log("USER", user.getId(), "LOGIN");

        return jwtService.generateToken(user);
    }

    @Transactional
    public void changeOwnPassword(String username, ChangePasswordRequest request) {
        log.info("Changing password for username={}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Incorrect current password for username={}", username);
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log("USER", user.getId(), "CHANGE_PASSWORD");
        log.info("Password changed for username={}", username);
    }

    @Transactional
    public void changePasswordById(Long id, AdminChangePasswordRequest request) {
        log.info("Admin changing password for userId={}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found: id={}", id);
                    return new ResourceNotFoundException("User not found");
                });

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log("USER", id, "ADMIN_CHANGE_PASSWORD");
        log.info("Password changed for userId={}", id);
    }
}