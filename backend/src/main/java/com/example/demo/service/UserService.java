package com.example.demo.service;

import com.example.demo.Enum.Role;

import com.example.demo.entity.Competence;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
;



@Service
public class UserService {
    public UserService(entrepriseRepository ent, UserRepository userRepository, PasswordEncoder passwordEncoder, freelancerRepository prest) {
        this.ent = ent;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.prest = prest;
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final freelancerRepository prest;
    private final entrepriseRepository ent;


    public User registerPrestataire(String nom, String prenom, String email, String password, String phone) {
         //verifier avant de creer
        if(userRepository.findByEmail(email).isPresent()){
             throw new RuntimeException("Email deja utilisé");
         }
         //generer un code d'activation
        String activationCode= UUID.randomUUID().toString();
             User u = new User();

               u.setEmail(email);
               u.setPassword(passwordEncoder.encode(password));
               u.setPhone(phone);
               u.setRole(Role.FREELANCER);
                u.setEnabled(false);
                u.setActivationCode(activationCode);


        u = userRepository.save(u);

        Freelancer p = new Freelancer();
               p.setUser(u);
               p.setNom(nom);
               p.setPrenom(prenom);



        prest.save(p);
        return u;
    }

    public User registerEntreprise(String nomEntreprise, String responsable,String email, String password, String phone, String secteur, String  siteweb, String ville, String adresse ) {
        if(userRepository.findByEmail(email).isPresent()){
            throw new RuntimeException("Email deja utilisé");
        }
        //generer un code d'activation
        String activationCode= UUID.randomUUID().toString();

        User user = new User();

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(Role.ENTREPRISE );
        user.setEnabled(false);
        user.setActivationCode(activationCode);


        user = userRepository.save(user);

        Entreprise e = new Entreprise();
          e.setUser(user);
          e.setNomEntreprise(nomEntreprise);
          e.setResponsable(responsable);
          e.setSecteur(secteur);
          e.setSiteweb(siteweb);
          e.setVille(ville);
          e.setAdresse(adresse);


        ent.save(e);
        return user;
    }

    public Optional<User> findByEmail(String email){
        return userRepository.findByEmail(email);
    }
    public Optional<User> findByEmailWithRelations(String email){
        return userRepository.findByEmailWithRelations(email);
    }
    public Optional<User> findByActivationCode (String code){
        return userRepository. findByActivationCode(code);
    }

}
