package ru.plaza.plaza_crm.cars;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long> {
    Optional<Car> findByIdAndDeletedFalse(Long id);

    boolean existsByBrandAndModelAndDeletedFalse(String brand, String model);
}