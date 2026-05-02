package ru.plaza.plaza_crm.warehouse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.products.ProductRepository;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class AssemblyService {

    private static final Logger log = LoggerFactory.getLogger(AssemblyService.class);

    private final AssemblyLogRepository assemblyLogRepository;
    private final ProductComponentRepository productComponentRepository;
    private final ComponentRepository componentRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    @Autowired
    public AssemblyService(AssemblyLogRepository assemblyLogRepository,
                           ProductComponentRepository productComponentRepository,
                           ComponentRepository componentRepository,
                           ProductRepository productRepository,
                           AuditService auditService) {
        this.assemblyLogRepository = assemblyLogRepository;
        this.productComponentRepository = productComponentRepository;
        this.componentRepository = componentRepository;
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional
    public void assemble(Long productId, int quantity, String username) {
        log.info("Assembling productId={} qty={} by {}", productId, quantity, username);

        List<ProductComponent> bom = productComponentRepository.findByProductId(productId);
        if (bom.isEmpty()) {
            throw new BadRequestException("У товара нет спецификации — невозможно собрать");
        }

        // списываем компоненты с pessimistic lock
        for (ProductComponent entry : bom) {
            Component component = componentRepository
                    .findByIdForUpdate(entry.getComponent().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Компонент не найден"));

            component.decreaseStock(entry.getQuantity() * quantity);
        }

        // увеличиваем остаток готового товара
        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Товар не найден"));
        product.setStockQuantity(product.getStockQuantity() + quantity);

        // пишем лог
        AssemblyLog assemblyLog = new AssemblyLog();
        assemblyLog.setProduct(product);
        assemblyLog.setQuantity(quantity);
        assemblyLog.setUsername(username);
        assemblyLogRepository.save(assemblyLog);

        auditService.log("ASSEMBLY", productId, "ASSEMBLE", username);
        log.info("Assembly complete productId={} qty={}", productId, quantity);
    }

    @Transactional(readOnly = true)
    public Page<AssemblyLogResponse> getLogs(Long productId, Pageable pageable) {
        return assemblyLogRepository.search(productId, pageable)
                .map(this::toResponse);
    }

    private AssemblyLogResponse toResponse(AssemblyLog a) {
        return new AssemblyLogResponse(
                a.getId(),
                a.getProduct().getId(),
                a.getProduct().getName(),
                a.getQuantity(),
                a.getUsername(),
                a.getCreatedAt()
        );
    }
}