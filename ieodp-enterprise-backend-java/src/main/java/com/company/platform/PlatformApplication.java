package com.company.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main application class for IEODP Platform.
 * Intelligent Enterprise Operations & Decision Platform
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.company.platform")
public class PlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
