package ru.plaza.plaza_crm.products;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductsService {
    private final ProductsRepository productsRepository;

    @Autowired
    public ProductsService(ProductsRepository productsRepository) {
        this.productsRepository = productsRepository;
    }

    List<Product> getAllProducts() {
        return productsRepository.findAll();
    }

    Product addProduct(Product product) {
        return productsRepository.save(product);
    }
}
