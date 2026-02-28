package ru.plaza.plaza_crm.util.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handleApiException(ApiException ex) {

        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "status", ex.getStatus(),
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnexpected(Exception ex) {

        return ResponseEntity
                .status(500)
                .body(Map.of(
                        "timestamp", LocalDateTime.now(),
                        "status", 500,
                        "message", ex.getMessage()
                ));
    }
}