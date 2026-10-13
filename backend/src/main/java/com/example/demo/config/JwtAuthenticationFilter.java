package com.example.demo.config;

import com.example.demo.Dto.UserPrincipal;
import com.example.demo.service.UserPrincipalService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserPrincipalService userPrincipalService;

    public JwtAuthenticationFilter(
            JwtTokenProvider tokenProvider,
            UserPrincipalService userPrincipalService
    ) {
        this.tokenProvider = tokenProvider;
        this.userPrincipalService = userPrincipalService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String jwt = getJwtFromRequest(request);

            if (
                    StringUtils.hasText(jwt)
                            && SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null
            ) {

                if (tokenProvider.validateToken(jwt)) {

                    Long userId =
                            tokenProvider.getUserIdFromJWT(jwt);

                    UserPrincipal userDetails =
                            userPrincipalService.loadUserById(userId);
                    System.out.println("===== JWT DEBUG =====");
                    System.out.println("User ID JWT : " + userId);
                    System.out.println("Email       : " + userDetails.getUsername());
                    System.out.println("Role        : " + userDetails.getRole());
                    System.out.println("Authorities : " + userDetails.getAuthorities());
                    System.out.println("Freelancer ID : " + userDetails.getFreelancerId());
                    System.out.println("Entreprise ID : " + userDetails.getEntrepriseId());
                    System.out.println("=====================");

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (Exception ignored) {
            logger.warn("Échec d'authentification JWT : " + ignored.getMessage(), ignored);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(
            HttpServletRequest request
    ) {

        String bearerToken =
                request.getHeader("Authorization");

        if (
                StringUtils.hasText(bearerToken)
                        && bearerToken.startsWith("Bearer ")
        ) {
            return bearerToken.substring(7);
        }

        return null;
    }
}