package ru.plaza.plaza_crm.customers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(CustomerMapper::toResponse)
                .toList();

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
