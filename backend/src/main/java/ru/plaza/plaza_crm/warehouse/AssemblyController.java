package ru.plaza.plaza_crm.warehouse;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/assembly")
public class AssemblyController {

    private final AssemblyService assemblyService;

    @Autowired
    public AssemblyController(AssemblyService assemblyService) {
        this.assemblyService = assemblyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assemble(@Valid @RequestBody AssemblyRequest request,
                         Principal principal) {
        assemblyService.assemble(request.getProductId(), request.getQuantity(), principal.getName());
    }

    @GetMapping("/logs")
    public Page<AssemblyLogResponse> getLogs(
            @RequestParam(required = false) Long productId,
            Pageable pageable) {
        return assemblyService.getLogs(productId, pageable);
    }
}