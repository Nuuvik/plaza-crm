package ru.plaza.plaza_crm.warehouse;

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
public class ComponentService {

    private static final Logger log = LoggerFactory.getLogger(ComponentService.class);

    private final ComponentRepository componentRepository;
    private final ProductComponentRepository productComponentRepository;
    private final AuditService auditService;

    @Autowired
    public ComponentService(ComponentRepository componentRepository,
                            ProductComponentRepository productComponentRepository,
                            AuditService auditService) {
        this.componentRepository = componentRepository;
        this.productComponentRepository = productComponentRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<ComponentResponse> findAll(String name, String sku, Pageable pageable) {
        return componentRepository.search(name, sku, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ComponentResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public ComponentResponse create(ComponentRequest request) {
        log.info("Creating component sku={}", request.getSku());

        if (componentRepository.existsBySkuAndDeletedFalse(request.getSku())) {
            throw new BadRequestException("Компонент с таким артикулом уже существует");
        }

        Component component = new Component();
        component.setSku(request.getSku());
        component.setName(request.getName());
        component.setStockQuantity(request.getStockQuantity());

        Component saved = componentRepository.save(component);
        auditService.log("COMPONENT", saved.getId(), "CREATE");
        log.info("Component created id={}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public ComponentResponse update(Long id, ComponentRequest request) {
        log.info("Updating component id={}", id);

        Component component = getOrThrow(id);

        if (componentRepository.existsBySkuAndIdNotAndDeletedFalse(request.getSku(), id)) {
            throw new BadRequestException("Компонент с таким артикулом уже существует");
        }

        component.setSku(request.getSku());
        component.setName(request.getName());
        component.setStockQuantity(request.getStockQuantity());

        componentRepository.save(component);
        auditService.log("COMPONENT", id, "UPDATE");
        return toResponse(component);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting component id={}", id);

        Component component = getOrThrow(id);

        if (productComponentRepository.existsByComponentId(id)) {
            throw new BadRequestException(
                    "Компонент используется в спецификации товаров. Сначала удалите его из BOM."
            );
        }

        component.setDeleted(true);
        componentRepository.save(component);
        auditService.log("COMPONENT", id, "DELETE");
    }

    @Transactional
    public ComponentResponse adjustStock(Long id, int quantity) {
        log.info("Adjusting stock for component id={} qty={}", id, quantity);

        Component component = getOrThrow(id);
        component.increaseStock(quantity);

        componentRepository.save(component);
        auditService.log("COMPONENT", id, "STOCK_IN");
        return toResponse(component);
    }

    private Component getOrThrow(Long id) {
        return componentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Component not found id={}", id);
                    return new ResourceNotFoundException("Компонент не найден");
                });
    }

    private ComponentResponse toResponse(Component c) {
        return new ComponentResponse(c.getId(), c.getSku(), c.getName(), c.getStockQuantity());
    }
}