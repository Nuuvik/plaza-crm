package ru.plaza.plaza_crm.products;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;

    @Autowired
    public ProductController(ProductService service) {
        this.service = service;
    }


    @GetMapping
    public Page<ProductResponse> getAll(
            @RequestParam(required = false) Long carId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sku,
            Pageable pageable) {
        return service.findAll(carId, name, sku, pageable);
    }

    @GetMapping("/archived")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ProductResponse> getArchived(
            @RequestParam(required = false) Long carId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sku,
            Pageable pageable) {
        return service.findAllArchived(carId, name, sku, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/orders-count")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getOrdersCount(@PathVariable Long id) {
        return Map.of("count", service.countOrders(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse archive(@PathVariable Long id) {
        return service.archive(id);
    }

    @PatchMapping("/{id}/unarchive")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse unarchive(@PathVariable Long id) {
        return service.unarchive(id);
    }

    @GetMapping("/sku/{sku}")
    public ProductResponse getBySku(@PathVariable String sku) {
        return service.findBySku(sku);
    }
}
