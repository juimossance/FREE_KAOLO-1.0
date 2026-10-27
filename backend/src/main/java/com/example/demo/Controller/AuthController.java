package com.example.demo.Controller;



import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.loginRequest;
import com.example.demo.Dto.registerRequest;
import com.example.demo.Enum.Role;
import com.example.demo.config.JwtAuthenticationResponse;
import com.example.demo.config.JwtTokenProvider;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.Emailservice;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-0.onrender.com"
})
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final Emailservice emailservice;
    private final UserService userService;

    private final freelancerRepository p;

    private final entrepriseRepository e;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, Emailservice emailservice, UserService userService, freelancerRepository p, entrepriseRepository e) {
        this.userRepository = userRepository;
        this.emailservice = emailservice;
        this.userService = userService;
        this.p = p;
        this.e = e;
    }
    // ---------------------- Register Prestataire ----------------------
    @PostMapping("/register/prestataire")
    public ResponseEntity<String> registerPrestataire(
            @RequestBody registerRequest request) {

        User u = userService.registerPrestataire(
                request.getNom(), request.getPrenom(), request.getEmail(), request.getPassword(), request.getPhone()

        );

        System.out.println("🟢 Utilisateur créé avec le code : " + u.getActivationCode());

        String activationLink = "http://localhost:8080/api/auth/activate?code=" + u.getActivationCode();

        System.out.println("🟡 Lancement de l'envoi asynchrone...");

        // Envoi asynchrone de l'email
        CompletableFuture.runAsync(() -> {
            System.out.println("🔵 Inside async task - début envoi email");
            try {
                String htmlContent = "<html><body style='font-family: Arial; text-align: center; margin-top: 50px;'>"
                        + "<h1 style='color: #4CAF50;'>Bienvenue ! 🎉</h1>"
                        + "<p>Merci de vous être inscrit. Pour activer votre compte,copiez le code  ci-dessous :</p>"
                        + "<p style='margin: 20px 0;'><strong>Code d'activation :</strong> " + u.getActivationCode() + "</p>"
                        + "<a href='" + activationLink + "' "
                        + "<a href='http://localhost:5173/login" + activationLink + "' style='color: #4CAF50;'>" + activationLink + "</a>"
                        + "</p>"
                        + "</body></html>";

                System.out.println("🟡 Appel de emailservice.sendEmail()...");
                emailservice.sendEmail(request.getEmail(), "Activation de votre compte", htmlContent);
                System.out.println("🟢 Email envoyé avec succès !");

            } catch (Exception e) {
                System.err.println("🔴 ERREUR dans l'envoi asynchrone : " + e.getClass().getName());
                System.err.println("🔴 Message : " + e.getMessage());
                e.printStackTrace();
            }
        });

        System.out.println("🟢 Réponse 200 OK envoyée");
        return ResponseEntity.ok("Inscription réussie. Vérifiez votre email d'activation.");
    }


    // ---------------------- Register Entreprise ----------------------
    @PostMapping("/register/entreprise")
    public ResponseEntity<  String> registerEntreprise(
            @RequestBody registerRequest request) {

        User u = userService.registerEntreprise(
               request.getNomEntreprise(), request.getResponsable(), request.getEmail(), request.getPassword(), request.getPhone(), request.getSecteur(), request.getSiteweb(),request.getVille(),request.getAdresse()
        );


            System.out.println("🟢 Utilisateur créé avec le code : " + u.getActivationCode());

            String activationLink = "http://localhost:8080/api/auth/activate?code=" + u.getActivationCode();

            System.out.println("🟡 Lancement de l'envoi asynchrone...");

            // Envoi asynchrone de l'email
            CompletableFuture.runAsync(() -> {
                System.out.println("🔵 Inside async task - début envoi email");
                try {
                    String htmlContent = "<html><body style='font-family: Arial; text-align: center; margin-top: 50px;'>"
                            + "<h1 style='color: #4CAF50;'>Bienvenue ! 🎉</h1>"
                            + "<p>Merci de vous être inscrit. Pour activer votre compte,copiez le code  ci-dessous :</p>"
                            + "<p style='margin: 20px 0;'><strong>Code d'activation :</strong> " + u.getActivationCode() + "</p>"
                            + "<a href='" + activationLink + "' "
                            + "<a href='http://localhost:5173/login" + activationLink + "' style='color: #4CAF50;'>" + activationLink + "</a>"
                            + "</p>"
                            + "</body></html>";

                    System.out.println("🟡 Appel de emailservice.sendEmail()...");
                    emailservice.sendEmail(request.getEmail(), "Activation de votre compte", htmlContent);
                    System.out.println("🟢 Email envoyé avec succès !");

                } catch (Exception e) {
                    System.err.println("🔴 ERREUR dans l'envoi asynchrone : " + e.getClass().getName());
                    System.err.println("🔴 Message : " + e.getMessage());
                    e.printStackTrace();
                }
            });

            System.out.println("🟢 Réponse 200 OK envoyée");
            return ResponseEntity.ok("Inscription réussie. Vérifiez votre email d'activation.");
        }


    @GetMapping("/activate")
    public ResponseEntity<String> activateAccount(@RequestParam String code) {
        Optional<User> userOptional = userService.findByActivationCode(code);
        if (userOptional.isPresent()) {

            User user = userOptional.get();
            //verifie si le code est correct
            if (user.getActivationCode().equals(code)) {
                user.setEnabled(true);
                user.setActivationCode(null);//supp le code apres activation
                userRepository.save(user);
                return ResponseEntity.ok("compte activé avec succes");
            } else {
                return ResponseEntity.badRequest().body("code d'activation invalide!");
            }
        } else {
            return ResponseEntity
                    .badRequest()
                    .body("utilisateur introuvable");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody loginRequest loginRequest) {

        Optional<User> userOptional = userService.findByEmail(loginRequest.getEmail());

        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body("Utilisateur introuvable.");
        }

        User user = userOptional.get();

        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body("Votre compte n'est pas encore activé.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String jwt = tokenProvider.generateToken(userPrincipal);

        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }
    @GetMapping("/me")
    public ResponseEntity<registerRequest> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = currentUser.getId();
        Role role = currentUser.getRole();
        boolean enabled = currentUser.isEnabled();

        Long freelancerId = null;
        Long entrepriseId = null;
        String nom = "";

        if (role == Role.FREELANCER) {
            Freelancer f = p.findByUserId(userId).orElse(null);
            if (f != null) {
                freelancerId = f.getId();
                nom = f.getPrenom() + " " + f.getNom();
            }

        } else if (role == Role.ENTREPRISE) {
            Entreprise ent = e.findByUserId(userId).orElse(null);
            if (ent != null) {
                entrepriseId = ent.getId();
                nom = ent.getNomEntreprise();
            }
        }

        registerRequest response = new registerRequest();
        response.setUserId(userId);
        response.setEmail(currentUser.getEmail());
        response.setRole(role);
        response.setFreelancerId(freelancerId);
        response.setEntrepriseId(entrepriseId);
        response.setEnabled(enabled);
        response.setNom(nom);
        return ResponseEntity.ok(response);
    }
}


