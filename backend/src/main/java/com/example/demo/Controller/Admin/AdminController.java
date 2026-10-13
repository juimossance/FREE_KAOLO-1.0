package com.example.demo.Controller.Admin;

import com.example.demo.Enum.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record CreateAdminRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password,
            String phone) {}

    public record UserResponse(Long id, String email, String phone, Role role, boolean enabled) {
        static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getEmail(), u.getPhone(), u.getRole(), u.isEnabled());
        }
    }

    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody CreateAdminRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        User admin = new User();
        admin.setEmail(req.email());
        admin.setPhone(req.phone());
        admin.setPassword(passwordEncoder.encode(req.password()));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(userRepository.save(admin)));
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<UserResponse> setEnabled(@PathVariable Long id, @RequestParam boolean value) {
        return userRepository.findById(id)
                .map(u -> {
                    u.setEnabled(value);
                    return ResponseEntity.ok(UserResponse.from(userRepository.save(u)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication auth) {
        return userRepository.findById(id)
                .map(u -> {
                    if (u.getEmail().equals(auth.getName())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build(); // pas d'auto-suppression
                    }
                    userRepository.delete(u);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}