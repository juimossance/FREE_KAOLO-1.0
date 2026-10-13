package com.example.demo.config;

import com.example.demo.Dto.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

public final class OwnershipGuard {

    private OwnershipGuard() {}

    private static boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private static UserPrincipal principal(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal p)) {
            throw new AccessDeniedException("Non authentifié");
        }
        return p;
    }

    /** Le freelance connecté doit être le propriétaire (ou admin). */
    public static void requireFreelancer(Authentication auth, Long freelancerId) {
        if (isAdmin(auth)) return;
        Long mine = principal(auth).getFreelancerId();
        if (mine == null || !mine.equals(freelancerId)) {
            throw new AccessDeniedException("Accès refusé");
        }
    }

    /** L'entreprise connectée doit être la propriétaire (ou admin). */
    public static void requireEntreprise(Authentication auth, Long entrepriseId) {
        if (isAdmin(auth)) return;
        Long mine = principal(auth).getEntrepriseId();
        if (mine == null || !mine.equals(entrepriseId)) {
            throw new AccessDeniedException("Accès refusé");
        }
    }
}
