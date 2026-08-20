package com.example.demo.service;



import com.example.demo.Dto.CertificationDTO;
import com.example.demo.Dto.CertificationFormDTO;

import java.util.List;

public interface Certificationservice {

    List<CertificationDTO> getAllByFreelancer(Long freelancerId);


    CertificationDTO create(Long freelancerId, CertificationFormDTO form);

    CertificationDTO resubmit(Long id, CertificationFormDTO form);

    void delete(Long id);
}
