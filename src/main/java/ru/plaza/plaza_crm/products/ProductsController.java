package ru.plaza.plaza_crm.products;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductsController {
    private final ProductsService productsService;

    @Autowired
    public ProductsController(ProductsService productsService) {
        this.productsService = productsService;
    }

    @GetMapping("/get-all-products")
    public List<Product> getAllProducts() {
        return productsService.getAllProducts();
    }

    @PostMapping("/add-product")
    public Product addProduct(@RequestBody Product product) {
        return productsService.addProduct(product);
    }

}
