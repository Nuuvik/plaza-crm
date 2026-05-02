package ru.plaza.plaza_crm.warehouse;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products/{productId}/bom")
public class BomController {

    private final BomService bomService;

    @Autowired
    public BomController(BomService bomService) {
        this.bomService = bomService;
    }

    @GetMapping
    public List<ProductComponentResponse> getBom(@PathVariable Long productId) {
        return bomService.getBom(productId);
    }

    @GetMapping("/max-assemblable")
    public Map<String, Integer> getMaxAssemblable(@PathVariable Long productId) {
        return Map.of("maxAssemblable", bomService.calculateMaxAssemblable(productId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductComponentResponse addOrUpdate(@PathVariable Long productId,
                                                @Valid @RequestBody ProductComponentRequest request) {
        return bomService.addOrUpdate(productId, request);
    }

    @DeleteMapping("/{componentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void remove(@PathVariable Long productId,
                       @PathVariable Long componentId) {
        bomService.remove(productId, componentId);
    }
}