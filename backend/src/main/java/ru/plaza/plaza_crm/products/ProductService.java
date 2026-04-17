package ru.plaza.plaza_crm.products;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.orders.OrderRepository;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;
    private final AuditService auditService;
    private final OrderRepository orderRepository;

    @Autowired
    public ProductService(ProductRepository repository, AuditService auditService,
                          OrderRepository orderRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.orderRepository = orderRepository;
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
        product.setAdditions(request.getAdditions());

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
        product.setAdditions(request.getAdditions());
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

        long orderCount = orderRepository.countOrdersWithProduct(id);
        if (orderCount > 0) {
            log.warn("Cannot delete product id={}: used in {} orders", id, orderCount);
            throw new BadRequestException("Product is used in orders. Use archive instead.");
        }

        product.setDeleted(true);
        repository.save(product);
        auditService.log("PRODUCT", id, "DELETE");
    }

    @Transactional
    public ProductResponse archive(Long id) {
        log.info("Archiving product id={}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.isArchived()) {
            throw new BadRequestException("Product is already archived");
        }

        product.setArchived(true);
        repository.save(product);
        auditService.log("PRODUCT", id, "ARCHIVE");

        log.info("Product archived id={}", id);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse unarchive(Long id) {
        log.info("Unarchiving product id={}", id);

        Product product = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.isArchived()) {
            throw new BadRequestException("Product is not archived");
        }

        product.setArchived(false);
        repository.save(product);
        auditService.log("PRODUCT", id, "UNARCHIVE");

        log.info("Product unarchived id={}", id);
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public long countOrders(Long id) {
        if (!repository.findByIdAndDeletedFalse(id).isPresent()) {
            throw new ResourceNotFoundException("Product not found");
        }
        return orderRepository.countOrdersWithProduct(id);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(String car, String name, String sku, Pageable pageable) {
        return repository.search(car, name, sku, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAllArchived(String car, String name, String sku, Pageable pageable) {
        return repository.searchArchived(car, name, sku, pageable).map(this::mapToResponse);
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
                product.getStockQuantity(),
                product.getAdditions(),
                product.isArchived()
        );
    }
}