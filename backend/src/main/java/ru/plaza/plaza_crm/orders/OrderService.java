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
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

import java.time.LocalDateTime;

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
                        ProductRepository productRepository,
                        AuditService auditService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.auditService = auditService;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for customerId={}", request.getCustomerId());
        Customer customer = customerRepository.findByIdAndDeletedFalse(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Order order = new Order();
        order.initAsNew(customer);

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findByIdAndDeletedFalseAndArchivedFalse(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            order.addOrIncreaseItem(product, itemRequest.getQuantity());
        }

        Order saved = orderRepository.save(order);
        auditService.log("ORDER", saved.getId(), "CREATE");
        log.info("Order created: id={} total={}", saved.getId(), saved.getTotalAmount());
        return OrderMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        return OrderMapper.toResponse(findActiveOrder(id));
    }

    @Transactional(readOnly = true)
    public Page<OrderListResponse> getOrders(OrderStatus status, Long customerId,
                                             LocalDateTime from, LocalDateTime to,
                                             Pageable pageable) {
        return orderRepository.search(status, customerId, from, to, pageable)
                .map(OrderMapper::toListResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderListResponse> getOrdersByCustomer(Long customerId, Pageable pageable) {
        if (!customerRepository.existsByIdAndDeletedFalse(customerId)) {
            throw new ResourceNotFoundException("Customer not found");
        }
        return orderRepository.findByCustomerIdAndDeletedFalse(customerId, pageable)
                .map(OrderMapper::toListResponse);
    }

    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order id={}", id);
        Order order = findActiveOrder(id);
        if (order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.SHIPPED) {
            for (OrderItem item : order.getItems()) {
                if (!Boolean.TRUE.equals(item.getDeleted())) {
                    item.getProduct().increaseStock(item.getQuantity());
                }
            }
        }
        order.setDeleted(true);
        orderRepository.save(order);
        auditService.log("ORDER", id, "DELETE");
    }

    @Transactional
    public OrderResponse confirmOrder(Long id) {
        Order order = findActiveOrder(id);
        order.confirm();
        orderRepository.save(order);
        auditService.log("ORDER", id, "CONFIRM");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = findActiveOrder(id);
        order.cancel();
        orderRepository.save(order);
        auditService.log("ORDER", id, "CANCEL");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse shipOrder(Long id) {
        Order order = findActiveOrder(id);
        order.ship();
        orderRepository.save(order);
        auditService.log("ORDER", id, "SHIP");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse completeOrder(Long id) {
        log.info("Completing order id={}", id);
        Order order = findActiveOrder(id);
        order.complete();
        orderRepository.save(order);
        auditService.log("ORDER", id, "COMPLETE");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updatePayment(Long id, boolean paid) {
        log.info("Updating payment for orderId={} paid={}", id, paid);
        Order order = findActiveOrder(id);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot update payment for cancelled order");
        }
        order.setPaid(paid);
        orderRepository.save(order);
        auditService.log("ORDER", id, paid ? "MARK_PAID" : "MARK_UNPAID");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateNotes(Long id, UpdateNotesRequest request) {
        Order order = findActiveOrder(id);
        order.setNotes(request.getNotes());
        orderRepository.save(order);
        auditService.log("ORDER", id, "UPDATE_NOTES");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateDetails(Long id, UpdateOrderDetailsRequest request) {
        log.info("Updating details for orderId={}", id);
        Order order = findActiveOrder(id);
        if (request.getSource() != null) order.setSource(request.getSource());
        if (request.getPaymentMethod() != null) order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentDate(request.getPaymentDate());
        orderRepository.save(order);
        auditService.log("ORDER", id, "UPDATE_DETAILS");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse addItem(Long orderId, Long productId, int quantity) {
        Order order = findActiveOrder(orderId);
        Product product = productRepository.findByIdAndDeletedFalseAndArchivedFalse(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        order.addOrIncreaseItem(product, quantity);
        orderRepository.save(order);
        auditService.log("ORDERITEM", orderId, "ADD");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse updateItem(Long orderId, Long productId, int quantity) {
        Order order = findActiveOrder(orderId);
        order.updateItemQuantity(productId, quantity);
        orderRepository.save(order);
        auditService.log("ORDERITEM", orderId, "UPDATE");
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse removeItem(Long orderId, Long productId) {
        Order order = findActiveOrder(orderId);
        order.removeItem(productId);
        orderRepository.save(order);
        auditService.log("ORDERITEM", orderId, "DELETE");
        return OrderMapper.toResponse(order);
    }

    private Order findActiveOrder(Long id) {
        return orderRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn("Order not found: id={}", id);
                    return new ResourceNotFoundException("Order not found");
                });
    }
}