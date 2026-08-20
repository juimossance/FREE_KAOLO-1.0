package com.example.demo.Dto;


import com.example.demo.Enum.Role;


import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;
    private final String phone;
    private  Role role;
    private final Long freelancerId;
    private final Long entrepriseId;
    public UserPrincipal(Long id, String email, String password, Role role, boolean enabled, String phone, Long freelancerId, Long entrepriseId) {
        this.id = id;
        this.email = email;
        this.role=role;
        this.password = password;
        this.enabled = enabled;
        this.phone=phone;
         this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" +  role.name()));

        this.freelancerId = freelancerId;
        this.entrepriseId = entrepriseId;
    }

    public static UserPrincipal create(User user, Freelancer freelancer, Entreprise entreprise) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.isEnabled(),
                user.getPhone(),
                user.getPrestataire() != null ? user.getPrestataire().getId() : null,
                user.getEntreprise()  != null ? user.getEntreprise().getId()  : null


        );
    }

    public Long getId() {
        return id;
    }

    public Long getEntrepriseId() {
        return entrepriseId;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }
    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
