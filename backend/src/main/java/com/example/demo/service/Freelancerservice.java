package com.example.demo.service;

import com.example.demo.Dto.freelancerDto;


import com.example.demo.entity.Freelancer;
import com.example.demo.entity.User;
import com.example.demo.repository.freelancerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Freelancerservice {

    @Autowired
    private freelancerRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Freelancer create(freelancerDto dto) {
        User u= new User();
        Freelancer p = new Freelancer();
        u.setEmail(dto.getEmail());
        u.setRole(dto.getRole());
        u.setPhone(dto.getPhone());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
p.setNom(dto.getNom());
p.setPrenom(dto.getPrenom());
        p.setPays(dto.getPays());
        p.setSpecialite(dto.getSpecialite());
        p.setExperience(dto.getExperience());
        p.setCompetence(dto.getCompetence());
        p.setDescription(dto.getDescription());
        u.setPhone(dto.getPhone());
        p.setUser(u);
    return repository.save(p);
    }

    public List<Freelancer> getAll() {
        return repository.findAll();
    }

    public Freelancer getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Not Found"));
    }

    public void desactiverCompte(Long prestataireId) {
        Optional<Freelancer> opt = repository.findById(prestataireId);
        if (opt.isPresent()) {
            Freelancer freelancer = opt.get();
            User u= freelancer.getUser();
            u.setEnabled(false);
           repository.save(freelancer);
        } else {
            throw new RuntimeException("Prestataire non trouvé");
        }
    }

    public void activerCompte(Long prestataireId) {
        Optional<Freelancer> opt = repository.findById(prestataireId);
        if (opt.isPresent()) {
            Freelancer freelancer = opt.get();
            User u= freelancer.getUser();
            u.setEnabled(true);
            repository.save(freelancer);
        } else {
            throw new RuntimeException("Prestataire non trouvé");
        }
    }

    public Freelancer update(Long id, freelancerDto dto) {
        Freelancer p = getById(id);
        User u= new User();
        u.setEmail(dto.getEmail());
        u.setRole(dto.getRole());
        u.setPhone(dto.getPhone());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        p.setNom(dto.getNom());
        p.setPrenom(dto.getPrenom());
        p.setPays(dto.getPays());
        p.setSpecialite(dto.getSpecialite());
        p.setExperience(dto.getExperience());
        p.setCompetence(dto.getCompetence());
        p.setDescription(dto.getDescription());
        u.setPhone(dto.getPhone());
        p.setUser(u);
        return repository.save(p);
    }
    public Freelancer getByUserId(Long userId) {

        return repository.findByUserId(userId).orElse(null);
    }
}