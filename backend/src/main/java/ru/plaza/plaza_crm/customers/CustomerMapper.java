package ru.plaza.plaza_crm.customers;

public class CustomerMapper {
    public static Customer toEntity(CustomerRequest dto) {
        Customer c = new Customer();
        c.setName(dto.getName());
        c.setPhone(dto.getPhone());
        c.setEmail(dto.getEmail());
        c.setTelegram(dto.getTelegram());
        c.setAddress(dto.getAddress());
        return c;
    }

    public static CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(
                c.getId(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getTelegram(),
                c.getAddress());
    }
}
