
package com.example.demo.config;


import com.example.demo.Dto.UserPrincipal;
import com.example.demo.entity.User;
import io.jsonwebtoken.*;
        import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs}")
    private  long jwtExpirationInMs;


    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UserPrincipal userPrincipal) {
        // ❌ User user = (User) userPrincipal;  → cast impossible

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .claim("role", userPrincipal.getRole())           // méthode à ajouter
                .claim("freelancerId", userPrincipal.getFreelancerId())  // méthode à ajouter
                .claim("entrepriseId", userPrincipal.getEntrepriseId())  // méthode à ajouter
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            System.err.println("❌ TOKEN EXPIRÉ : " + ex.getMessage());
            return false;
        } catch (SignatureException ex) {
            System.err.println("❌ SIGNATURE INVALIDE : " + ex.getMessage());
            return false;
        } catch (MalformedJwtException ex) {
            System.err.println("❌ TOKEN MALFORMÉ : " + ex.getMessage());
            return false;
        } catch (JwtException ex) {
            System.err.println("❌ AUTRE ERREUR JWT (" + ex.getClass().getSimpleName() + ") : " + ex.getMessage());
            return false;
        }
    }
}

