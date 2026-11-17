
package com.example.demo.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // ==============================
    // PASSWORD ENCODER
    // ==============================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==============================
    // AUTHENTICATION MANAGER
    // ==============================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // ==============================
    // CONFIGURATION CORS
    // ==============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> origins
    ) {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(origins);

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // ==============================
    // SECURITY FILTER CHAIN
    // ==============================
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // OPTIONS : requêtes préliminaires CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // AUTHENTIFICATION ET INSCRIPTION
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/activate",
                                "/api/auth/register/prestataire",
                                "/api/auth/register/entreprise"
                        ).permitAll()

                        // ROUTES PUBLIQUES
                        .requestMatchers(
                                "/error",
                                "/uploads/**"
                        ).permitAll()

                        // TESTS GROQ
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ai/test-groq-dns",
                                "/api/ai/test-groq-https",
                                "/api/ai/test-groq-post",
                                "/api/ai/test-java-proxy",
                                "/api/ai/test-network"
                        ).permitAll()

                        // AUTHENTIFICATION UTILISATEUR
                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()

                        // AVIS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer/candidatures/*/avis"
                        ).hasAnyRole("ENTREPRISE", "FREELANCER")

                        // FREELANCER
                        .requestMatchers(
                                "/api/freelancer/me/**"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer/*/detail"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancer/*/portfolio"
                        ).authenticated()

                        .requestMatchers(
                                "/api/freelancer/**"
                        ).hasRole("FREELANCER")

                        // CV
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/freelancers/*/cv"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/freelancers/*/cv"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/freelancers/*/cv"
                        ).hasRole("FREELANCER")

                        // ENTREPRISE
                        .requestMatchers(
                                "/api/entreprise/**"
                        ).hasRole("ENTREPRISE")

                        // PROJETS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets/me"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets/publics"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projets/candidatures/confirmer"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/projets/*/avancement"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/projets/*/avancement"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                "/api/projets/**"
                        ).hasRole("ENTREPRISE")

                        // IA ET CONVERSATIONS
                        .requestMatchers(
                                "/api/ai/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/conversations/**"
                        ).authenticated()

                        // PAIEMENTS
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/depot"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/*/liberer"
                        ).hasRole("ENTREPRISE")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/paiements/retrait"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/paiements/solde"
                        ).hasRole("FREELANCER")

                        .requestMatchers(
                                "/api/paiements/**"
                        ).authenticated()

                        // DASHBOARD
                        .requestMatchers(
                                "/api/dashboard/freelancer/**"
                        ).hasRole("FREELANCER")

                        // ADMINISTRATION
                        .requestMatchers(
                                "/admin/**"
                        ).hasRole("ADMIN")

                        // TOUTES LES AUTRES ROUTES
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())

                .httpBasic(basic -> basic.disable());

        // FILTRE JWT
        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}
