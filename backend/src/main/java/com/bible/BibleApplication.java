package com.bible;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.bible.module")
public class BibleApplication {

    public static void main(String[] args) {
        SpringApplication.run(BibleApplication.class, args);
    }
}