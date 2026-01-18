package ru.plaza.plaza_crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class }) //TODO временный exclude пока не добавил БД
public class PlazaCrmApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlazaCrmApplication.class, args);
	}

}
