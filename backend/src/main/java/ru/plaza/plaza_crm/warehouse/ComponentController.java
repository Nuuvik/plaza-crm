package ru.plaza.plaza_crm.warehouse;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/components")
public class ComponentController {

    private final ComponentService componentService;

    @Autowired
    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }

    @GetMapping
    public Page<ComponentResponse> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sku,
            Pageable pageable) {
        return componentService.findAll(name, sku, pageable);
    }

    @GetMapping("/{id}")
    public ComponentResponse getById(@PathVariable Long id) {
        return componentService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ComponentResponse create(@Valid @RequestBody ComponentRequest request) {
        return componentService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ComponentResponse update(@PathVariable Long id,
                                    @Valid @RequestBody ComponentRequest request) {
        return componentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        componentService.delete(id);
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    public ComponentResponse adjustStock(@PathVariable Long id,
                                         @Valid @RequestBody StockAdjustRequest request) {
        return componentService.adjustStock(id, request.getQuantity());
    }
}