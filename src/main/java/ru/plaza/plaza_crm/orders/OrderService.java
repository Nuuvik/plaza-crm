package ru.plaza.plaza_crm.orders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.customers.Customer;
import ru.plaza.plaza_crm.customers.CustomerRepository;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.products.ProductRepository;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository, AuditService auditService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for customerId={}", request.getCustomerId());
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> {
                    log.warn("Customer not found: id={}", request.getCustomerId());
                    return new ResourceNotFoundException("Customer not found");
                });

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.NEW);

        for (OrderItemRequest itemRequest : request.getItems()) {
            log.info("Adding productId={} quantity={}", itemRequest.getProductId(), itemRequest.getQuantity());
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> {
                        log.warn("Product not found: id={}", itemRequest.getProductId());
                        return new ResourceNotFoundException("Product not found");
                    });

            order.addOrIncreaseItem(product, itemRequest.getQuantity());
        }

        Order saved = orderRepository.save(order);

        auditService.log("ORDER", saved.getId(), "CREATE");

        log.info("Order created: id={} total={}", saved.getId(), saved.getTotalAmount());

        return OrderMapper.toResponse(saved);
    }

    public OrderResponse getOrder(Long id) {
        log.info("Getting order id={}", id);
        Order order = orderRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });
        return OrderMapper.toResponse(order);
    }

    public Page<OrderResponse> getOrders(OrderStatus status, Pageable pageable) {

        Page<Order> page = (status == null)
                ? orderRepository.findByDeletedFalse(pageable)
                : orderRepository.findByStatusAndDeletedFalse(status, pageable);

        return page.map(OrderMapper::toResponse);
    }

    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order id={}", id);
        Order order = orderRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.setDeleted(true);
    }

    @Transactional
    public OrderResponse confirmOrder(Long id) {
        log.info("Confirming order id={}", id);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.confirm();

        auditService.log("ORDER", id, "CONFIRM");

        log.info("Order confirmed: id={}", id);

        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        log.info("Cancelling order id={}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });
        order.cancel();
        auditService.log("ORDER", id, "CANCEL");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse payOrder(Long id) {
        log.info("Paying order id={}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.markAsPaid();
        auditService.log("ORDER", id, "PAY");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse shipOrder(Long id) {
        log.info("Shipping order id={}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.ship();
        auditService.log("ORDER", id, "SHIP");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse addItem(Long orderId, Long productId, int quantity) {
        log.info("Adding item to orderId={} productId={} quantity={}", orderId, productId, quantity);

        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", orderId);
                    return new ResourceNotFoundException("Order not found");
                });

        Product product = productRepository.findByIdAndDeletedFalse(productId)
                .orElseThrow(() -> {
                    log.warn("Product not found: id={}", productId);
                    return new ResourceNotFoundException("Product not found");
                });

        order.addOrIncreaseItem(product, quantity);

        auditService.log("ORDERITEM", orderId, "ADD");

        log.info("Item added. Order id={} newTotal={}", orderId, order.getTotalAmount());

        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateItem(Long orderId, Long productId, int quantity) {
        log.info("Updating item to orderId={} productId={} quantity={}", orderId, productId, quantity);
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", orderId);
                    return new ResourceNotFoundException("Order not found");
                });

        order.updateItemQuantity(productId, quantity);

        auditService.log("ORDERITEM", orderId, "UPDATE");

        log.info("Item updated. Order id={} productId={} newTotal={}", orderId, productId, order.getTotalAmount());

        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse removeItem(Long orderId, Long productId) {
        log.info("Removing item to orderId={} productId={} ", orderId, productId);
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", orderId);
                    return new ResourceNotFoundException("Order not found");
                });

        order.removeItem(productId);

        auditService.log("ORDERITEM", orderId, "DELETE");

        log.info("Item deleted. Order id={} productId={}", orderId, productId);

        return OrderMapper.toResponse(order);
    }
}
