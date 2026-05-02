package ru.plaza.plaza_crm.products;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.cars.Car;
import ru.plaza.plaza_crm.cars.CarRepository;
import ru.plaza.plaza_crm.cars.CarResponse;
import ru.plaza.plaza_crm.orders.OrderRepository;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository repository;
    private final AuditService auditService;
    private final OrderRepository orderRepository;
    private final CarRepository carRepository;

    @Autowired
    public ProductService(ProductRepository repository, AuditService auditService,
                          OrderRepository orderRepository, CarRepository carRepository) {
        this.repository = repository;
        this.auditService = auditService;
        this.orderRepository = orderRepository;
        this.carRepository = carRepository;
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
        product.setCar(resolveCar(request.getCarId()));
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
        product.setCar(resolveCar(request.getCarId()));
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
        if (repository.findByIdAndDeletedFalse(id).isEmpty()) {
            throw new ResourceNotFoundException("Product not found");
        }
        return orderRepository.countOrdersWithProduct(id);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(Long carId, String name, String sku, Pageable pageable) {
        return repository.search(carId, name, sku, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAllArchived(Long carId, String name, String sku, Pageable pageable) {
        return repository.searchArchived(carId, name, sku, pageable).map(this::mapToResponse);
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

    // вспомогательный метод — carId опционален
    private Car resolveCar(Long carId) {
        if (carId == null) return null;
        return carRepository.findByIdAndDeletedFalse(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Автомобиль не найден"));
    }

    private ProductResponse mapToResponse(Product product) {
        CarResponse carResponse = product.getCar() != null
                ? new CarResponse(
                product.getCar().getId(),
                product.getCar().getBrand(),
                product.getCar().getModel())
                : null;

        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getPrice(),
                carResponse,
                product.getStockQuantity(),
                product.getAdditions(),
                product.isArchived()
        );
    }
}