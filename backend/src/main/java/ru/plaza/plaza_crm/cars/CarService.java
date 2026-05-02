package ru.plaza.plaza_crm.cars;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.audit.AuditService;
import ru.plaza.plaza_crm.util.exception.BadRequestException;
import ru.plaza.plaza_crm.util.exception.ResourceNotFoundException;

@Service
public class CarService {

    private final CarRepository repository;
    private final AuditService auditService;

    @Autowired
    public CarService(CarRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<CarResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional
    public CarResponse create(CarRequest request) {
        if (repository.existsByBrandAndModelAndDeletedFalse(request.getBrand(), request.getModel())) {
            throw new BadRequestException("Такой автомобиль уже существует");
        }
        Car car = new Car();
        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        CarResponse carResponse = toResponse(repository.save(car));
        auditService.log("CAR", carResponse.getId(), "CREATE");
        return carResponse;
    }

    @Transactional
    public CarResponse update(Long id, CarRequest request) {
        Car car = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Автомобиль не найден"));
        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        CarResponse carResponse =  toResponse(repository.save(car));
        auditService.log("CAR", id, "UPDATE");
        return carResponse;
    }

    @Transactional
    public void delete(Long id) {
        Car car = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Автомобиль не найден"));
        car.setDeleted(true);
        repository.save(car);
        auditService.log("CAR", id, "DELETE");
    }

    private CarResponse toResponse(Car car) {
        return new CarResponse(car.getId(), car.getBrand(), car.getModel());
    }
}