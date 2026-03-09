package ru.plaza.plaza_crm.products;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;
    private final AuditService auditService;

    public ProductService(ProductRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    public ProductResponse create(ProductRequest request) {

        log.info("Creating product {}", request.getName());

        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCar(request.getCar());
        product.setStockQuantity(request.getStockQuantity());

        Product saved = repository.save(product);
        auditService.log("PRODUCT", saved.getId(), "CREATE");

        log.info("Product created id={}", saved.getId());

        return mapToResponse(saved);
    }

    public Page<ProductResponse> findAll(String car, Pageable pageable) {

        Page<Product> page = (car == null)
                ? repository.findByDeletedFalse(pageable)
                : repository.findByCarAndDeletedFalse(car, pageable);

        return page.map(this::mapToResponse);
    }

    public ProductResponse findById(Long id) {

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {

        log.info("Updating product {}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCar(request.getCar());
        product.setStockQuantity(request.getStockQuantity());

        auditService.log("PRODUCT", id, "UPDATE");

        return mapToResponse(product);
    }

    @Transactional
    public void delete(Long id) {

        log.info("Deleting product {}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        product.setDeleted(true);
        auditService.log("PRODUCT", id, "DELETE");
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