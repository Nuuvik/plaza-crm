package ru.plaza.plaza_crm.orders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.customers.Customer;
import ru.plaza.plaza_crm.customers.CustomerRepository;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.products.ProductRepository;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.NEW);

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Quantity exceeds stock limit");
            }
            product.decreaseStock(itemRequest.getQuantity());

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.getPrice());

            order.addItem(item);
        }

        Order saved = orderRepository.save(order);
        return OrderMapper.toResponse(saved);
    }

    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderMapper.toResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.confirm();
        return OrderMapper.toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.cancel();
        return OrderMapper.toResponse(order);
    }
}
