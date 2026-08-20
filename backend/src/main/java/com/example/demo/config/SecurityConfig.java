package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                        .addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "OPTIONS"
                        )
                        .allowedHeaders("*");
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // AUTHENTIFICATION PUBLIQUE
                        // =========================

                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/activate",
                                "/api/auth/register/prestataire",
                                "/api/auth/register/entreprise"
                        ).permitAll()

                        // =========================
                        // AUTH
                        // =========================

                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()

                        // =========================
                        // FREELANCER
                        // =========================

                        // Routes personnelles
                        .requestMatchers(
                                "/api/freelancer/me/**"
                        ).hasRole("FREELANCER")

                        // Profil public consulté par une entreprise
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer/*/detail"
                        ).hasRole("ENTREPRISE")
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer"
                        ).hasRole("ENTREPRISE")

                        // Portfolio public
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer/*/portfolio"
                        ).authenticated()

                        // Autres routes freelancer
                        .requestMatchers(
                                "/api/freelancer/**"
                        ).hasRole("FREELANCER")

                        // =========================
                        // ENTREPRISE
                        // =========================

                        .requestMatchers(
                                "/api/entreprise/me/**"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                "/api/entreprise/**"
                        ).hasRole("ENTREPRISE")

                        // =========================
                        // PROJETS
                        // =========================

                        // Liste publique des projets
                        // pour utilisateurs connectés
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets"
                        ).authenticated()

                        // Mes projets entreprise
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets/me"
                        ).hasRole("ENTREPRISE")

                        // Confirmation sélection candidats
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projets/candidatures/confirmer"
                        ).hasRole("ENTREPRISE")

                        // Autres opérations projets
                        .requestMatchers(
                                "/api/projets/**"
                        ).hasRole("ENTREPRISE")

                        // =========================
                        // IA
                        // =========================

                        .requestMatchers(
                                "/api/ai/**"
                        ).authenticated()
                        .requestMatchers(
                                "/api/conversations/**"
                        ).authenticated()


                        // =========================
                        // PAIEMENTS
                        // =========================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/initier"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/valider/**"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/retrait/**"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                "/api/paiements/**"
                        ).authenticated()

                        // =========================
                        // DASHBOARD
                        // =========================

                        .requestMatchers(
                                "/api/dashboard/freelancer/**"
                        ).hasRole("FREELANCER")

                        // =========================
                        // PAR DÉFAUT
                        // =========================

                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}