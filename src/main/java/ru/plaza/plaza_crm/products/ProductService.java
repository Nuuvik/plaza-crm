package ru.plaza.plaza_crm.products;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;
    private final AuditService auditService;

    @Autowired
    public ProductService(ProductRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {

        log.info("Creating product {}", request.getName());

        if (repository.existsBySkuAndDeletedFalse(request.getSku())) {
            log.warn("SKU already in use: sku={}", request.getSku());
            throw new BadRequestException("Product with this SKU already exists");
        }

        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCar(request.getCar());
        product.setStockQuantity(request.getStockQuantity());

        Product saved = repository.save(product);
        auditService.log("PRODUCT", saved.getId(), "CREATE");

        log.info("Product created id={}", saved.getId());

        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {

        log.info("Updating product id={}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        if (repository.existsBySkuAndIdNotAndDeletedFalse(request.getSku(), id)) {
            log.warn("SKU already in use: sku={}", request.getSku());
            throw new BadRequestException("Product with this SKU already exists");
        }

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setCar(request.getCar());
        product.setStockQuantity(request.getStockQuantity());
        repository.save(product);

        auditService.log("PRODUCT", id, "UPDATE");

        return mapToResponse(product);
    }

    @Transactional
    public void delete(Long id) {

        log.info("Deleting product id={}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        product.setDeleted(true);
        repository.save(product);
        auditService.log("PRODUCT", id, "DELETE");
    }


    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(String car, String name, String sku, Pageable pageable) {
        return repository.search(car, name, sku, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", id);
                    return new ResourceNotFoundException("Product not found");
                });

        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findBySku(String sku) {
        Product product = repository.findBySkuAndDeletedFalse(sku)
                .orElseThrow(() -> {
                    log.warn("Product not found: sku={}", sku);
                    return new ResourceNotFoundException("Product not found");
                });
        return mapToResponse(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getPrice(),
                product.getCar(),
                product.getStockQuantity()
        );
    }
}