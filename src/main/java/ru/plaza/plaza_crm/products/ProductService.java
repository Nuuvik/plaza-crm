package ru.plaza.plaza_crm.products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public ProductResponse create(ProductRequest request) {

        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCar(request.getCar());
        product.setStockQuantity(request.getStockQuantity());

        repository.save(product);

        return mapToResponse(product);
    }

    public Page<ProductResponse> findAll(String car, Pageable pageable) {
        Page<Product> page = (car == null)
                ? repository.findByDeletedFalse(pageable)
                : repository.findByCarAndDeletedFalse(car, pageable);

        return page.map(this::mapToResponse);
    }

    public ProductResponse findById(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return mapToResponse(product);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        repository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCar(),
                product.getStockQuantity()
        );
    }
}