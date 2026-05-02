package ru.plaza.plaza_crm.warehouse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.products.ProductRepository;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class BomService {

    private static final Logger log = LoggerFactory.getLogger(BomService.class);

    private final ProductComponentRepository productComponentRepository;
    private final ProductRepository productRepository;
    private final ComponentRepository componentRepository;

    @Autowired
    public BomService(ProductComponentRepository productComponentRepository,
                      ProductRepository productRepository,
                      ComponentRepository componentRepository) {
        this.productComponentRepository = productComponentRepository;
        this.productRepository = productRepository;
        this.componentRepository = componentRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductComponentResponse> getBom(Long productId) {
        getProductOrThrow(productId);
        return productComponentRepository.findByProductId(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public int calculateMaxAssemblable(Long productId) {
        List<ProductComponent> bom = productComponentRepository.findByProductId(productId);
        if (bom.isEmpty()) return 0;
        return bom.stream()
                .mapToInt(entry ->
                        entry.getComponent().getStockQuantity() / entry.getQuantity()
                )
                .min()
                .orElse(0);
    }

    @Transactional
    public ProductComponentResponse addOrUpdate(Long productId, ProductComponentRequest request) {
        log.info("Adding BOM entry productId={} componentId={}", productId, request.getComponentId());

        getProductOrThrow(productId);

        Component component = componentRepository.findByIdAndDeletedFalse(request.getComponentId())
                .orElseThrow(() -> new ResourceNotFoundException("Компонент не найден"));

        // если уже есть — обновляем количество
        ProductComponent entry = productComponentRepository
                .findByProductIdAndComponentId(productId, request.getComponentId())
                .orElseGet(() -> {
                    ProductComponent pc = new ProductComponent();
                    pc.setProduct(productRepository.getReferenceById(productId));
                    pc.setComponent(component);
                    return pc;
                });

        entry.setQuantity(request.getQuantity());
        ProductComponent saved = productComponentRepository.save(entry);
        return toResponse(saved);
    }

    @Transactional
    public void remove(Long productId, Long componentId) {
        log.info("Removing BOM entry productId={} componentId={}", productId, componentId);

        ProductComponent entry = productComponentRepository
                .findByProductIdAndComponentId(productId, componentId)
                .orElseThrow(() -> new BadRequestException("Позиция не найдена в спецификации"));

        productComponentRepository.delete(entry);
    }

    private Product getProductOrThrow(Long productId) {
        return productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Товар не найден"));
    }

    private ProductComponentResponse toResponse(ProductComponent pc) {
        return new ProductComponentResponse(
                pc.getId(),
                pc.getComponent().getId(),
                pc.getComponent().getSku(),
                pc.getComponent().getName(),
                pc.getQuantity()
        );
    }
}