package com.example.demo.service;



import com.example.demo.Dto.UserPrincipal;

import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserPrincipalService implements UserDetailsService {

    private final UserRepository userRepository;
    private final entrepriseRepository entrepriseRepository;
    private final freelancerRepository freelancerRepository;
    @Autowired
    public UserPrincipalService(UserRepository userRepository, entrepriseRepository entrepriseRepository, freelancerRepository freelancerRepository) {
        this.userRepository = userRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.freelancerRepository = freelancerRepository;
    }

    // Méthode appelée automatiquement par Spring Security pour charger l'utilisateur par email
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user  = userRepository
                .findByEmailWithDetails(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur non trouvé avec l'email : " + email));
        Entreprise entreprise = entrepriseRepository.findByUserId(user.getId()).orElse(null);
       Freelancer freelancer = freelancerRepository.findByUserId(user.getId()).orElse(null);

        return UserPrincipal.create(user,freelancer,entreprise);
    }

    // Facultatif : utile si tu veux aussi charger l'utilisateur par ID (ex : dans un JwtService)
    public UserPrincipal loadUserById(Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur non trouvé avec l'ID : " + id));
        Entreprise entreprise = entrepriseRepository.findByUserId(user.getId()).orElse(null);
        Freelancer freelancer = freelancerRepository.findByUserId(user.getId()).orElse(null);
        return UserPrincipal.create(user,freelancer,entreprise);
    }
}

