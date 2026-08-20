package com.example.demo.service;

import com.example.demo.Dto.entrepriseDto;

import com.example.demo.entity.Entreprise;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class entrepriseservice {
    @Autowired
    private entrepriseRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    public Entreprise create(entrepriseDto dto) {

        Entreprise e = new Entreprise();
        User u = new User();
        u.setEmail(dto.getEmail());
        u.setRole(dto.getRole());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setPhone(dto.getPhone());
       e.setSecteur(dto.getSecteur());
       e.setSiteweb(dto.getSiteweb());
       e.setResponsable(dto.getResponsable());
       e.setVille(dto.getVille());
      e.setAdresse(dto.getAdresse());
       e.setUser(u);

       return repository.save(e);
    }

    public List<Entreprise> getAll() {
        return repository.findAll();
    }

    public Entreprise getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not Found"));
    }

    public void desactiverCompte(Long entrepriseId) {
        Optional<Entreprise> opt = repository.findById(entrepriseId);
        if (opt.isPresent()) {
           Entreprise e = opt.get();
           User u=e.getUser();
          u.setEnabled(false);
            repository.save(e);
        } else {
            throw new RuntimeException("entreprise non trouvé");
        }
    }

    public void activerCompte(Long entrepriseId) {
        Optional<Entreprise> opt = repository.findById(entrepriseId);
        if (opt.isPresent()) {
            Entreprise entreprise1 = opt.get();
            User u=entreprise1.getUser();
            u.setEnabled(true);
            repository.save(entreprise1);
        } else {
            throw new RuntimeException("entreprise non trouvé");
        }
    }

    public Entreprise update(Long id, entrepriseDto dto) {
User u = new User();
        Entreprise e = new Entreprise();

        u.setEmail(dto.getEmail());
        u.setRole(dto.getRole());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setPhone(dto.getPhone());
        e.setSecteur(dto.getSecteur());
        e.setSiteweb(dto.getSiteweb());
        e.setResponsable(dto.getResponsable());
        e.setVille(dto.getVille());
        e.setAdresse(dto.getAdresse());
        e.setUser(u);
        return repository.save(e);
    }

}
