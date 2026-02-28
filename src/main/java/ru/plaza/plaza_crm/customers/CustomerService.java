package ru.plaza.plaza_crm.customers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Page<CustomerResponse> findAll(String name, String phone, String email, Pageable pageable) {
        return customerRepository.search(name, phone, email, pageable)
                .map(CustomerMapper::toResponse);
    }

    CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id).orElseThrow();
        return CustomerMapper.toResponse(customer);
    }

    CustomerResponse createCustomer(CustomerRequest customerRequest) {
        Customer customer = customerRepository.save(CustomerMapper.toEntity(customerRequest));
        return CustomerMapper.toResponse(customer);
    }
}
