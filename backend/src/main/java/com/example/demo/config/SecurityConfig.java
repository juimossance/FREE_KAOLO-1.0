package com.example.demo.config;

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
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
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
                registry.addMapping("/**")
                        config.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "https://free-kaolo-1-3.onrender.com"
));
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth

                        // public
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/activate",
                                "/api/auth/register/prestataire",
                                "/api/auth/register/entreprise"
                        ).permitAll()
                        .requestMatchers("/error", "/uploads/**").permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ai/test-groq-dns",
                                "/api/ai/test-groq-https",
                                "/api/ai/test-groq-post",
                                "/api/ai/test-java-proxy",
                                "/api/ai/test-network"
                        ).permitAll()

                        .requestMatchers("/api/auth/me").authenticated()

                        // avis : déplacé avant /api/freelancer/** sinon l'entreprise est bloquée
                        .requestMatchers(HttpMethod.GET, "/api/freelancer/candidatures/*/avis")
                        .hasAnyRole("ENTREPRISE", "FREELANCER")

                        // freelancer
                        .requestMatchers("/api/freelancer/me/**").hasRole("FREELANCER")
                        .requestMatchers(HttpMethod.GET, "/api/freelancer/*/detail").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.GET, "/api/freelancer").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.GET, "/api/freelancer/*/portfolio").authenticated()
                        .requestMatchers("/api/freelancer/**").hasRole("FREELANCER")

                        // cv (pluriel)
                        .requestMatchers(HttpMethod.GET, "/api/freelancers/*/cv").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/freelancers/*/cv").hasRole("FREELANCER")
                        .requestMatchers(HttpMethod.DELETE, "/api/freelancers/*/cv").hasRole("FREELANCER")

                        // entreprise
                        .requestMatchers("/api/entreprise/**").hasRole("ENTREPRISE")

                        // projets
                        .requestMatchers(HttpMethod.GET, "/api/projets").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/projets/me").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.GET, "/api/projets/publics").hasRole("FREELANCER")
                        .requestMatchers(HttpMethod.POST, "/api/projets/candidatures/confirmer").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.GET, "/api/projets/*/avancement").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/projets/*/avancement").hasRole("FREELANCER")
                        .requestMatchers("/api/projets/**").hasRole("ENTREPRISE")

                        // ia et conversations
                        .requestMatchers("/api/ai/**").authenticated()
                        .requestMatchers("/api/conversations/**").authenticated()

                        // paiements
                        .requestMatchers(HttpMethod.POST, "/api/paiements/depot").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.POST, "/api/paiements/*/liberer").hasRole("ENTREPRISE")
                        .requestMatchers(HttpMethod.POST, "/api/paiements/retrait").hasRole("FREELANCER")
                        .requestMatchers(HttpMethod.GET, "/api/paiements/solde").hasRole("FREELANCER")
                        .requestMatchers("/api/paiements/**").authenticated()

                        // dashboard et admin
                        .requestMatchers("/api/dashboard/freelancer/**").hasRole("FREELANCER")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

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
