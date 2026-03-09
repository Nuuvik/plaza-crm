package ru.plaza.plaza_crm.customers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class CustomerService {
    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    @Autowired
    public CustomerService(CustomerRepository customerRepository, AuditService auditService) {
        this.customerRepository = customerRepository;
        this.auditService = auditService;
    }

    public Page<CustomerResponse> findAll(String name, String phone, String email, Pageable pageable) {
        return customerRepository.search(name, phone, email, pageable)
                .map(CustomerMapper::toResponse);
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Customer not found: id={}", id);
                    return new ResourceNotFoundException("Customer not found");
                });

        return CustomerMapper.toResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        log.info("Creating customer {}", request.getName());

        if (request.getPhone() != null &&
                customerRepository.existsByPhoneAndDeletedFalse(request.getPhone())) {
            log.warn("Phone number already in use: phone={}", request.getPhone());
            throw new BadRequestException("Customer with this phone already exists");
        }

        if (request.getEmail() != null &&
                customerRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            log.warn("Email already in use: email={}", request.getEmail());
            throw new BadRequestException("Customer with this email already exists");
        }

        Customer customer = CustomerMapper.toEntity(request);
        customerRepository.save(customer);

        log.info("Customer created id={}", customer.getId());
        auditService.log("CUSTOMER", customer.getId(), "CREATE");

        return CustomerMapper.toResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        log.info("Updating customer id={}", id);

        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Customer not found: id={}", id);
                    return new ResourceNotFoundException("Customer not found");
                });

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setTelegram(request.getTelegram());
        customer.setAddress(request.getAddress());

        customerRepository.save(customer);

        log.info("Updated customer id={}", id);
        auditService.log("CUSTOMER", id, "UPDATE");

        return CustomerMapper.toResponse(customer);
    }

    public void deleteCustomer(Long id) {
        log.info("Deleting customer id={}", id);

        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Customer not found: id={}", id);
                    return new ResourceNotFoundException("Customer not found");
                });

        customer.setDeleted(true);

        customerRepository.save(customer);
        auditService.log("CUSTOMER", id, "DELETE");
    }
}
