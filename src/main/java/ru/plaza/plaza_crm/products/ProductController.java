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
public class ProductController {
    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/get-all-products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/add-product")
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

}
