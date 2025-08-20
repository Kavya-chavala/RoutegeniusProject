// src/main/java/com/routegenius/logistics/config/MailConfig.java
package com.routegenius.logistics.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.beans.factory.annotation.Value; // Import Value

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${spring.mail.protocol}")
    private String protocol;

    @Value("${spring.mail.properties.mail.smtp.auth}")
    private boolean auth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private boolean starttlsEnable;

    @Value("${spring.mail.properties.mail.smtp.starttls.required}")
    private boolean starttlsRequired;

    @Value("${spring.mail.properties.mail.smtp.ssl.enable}")
    private boolean sslEnable; // For port 465 (SSL)

    @Value("${spring.mail.properties.mail.smtp.ssl.trust}")
    private String sslTrust;

    // Optional: Add timeouts if you have them in properties
    @Value("${spring.mail.properties.mail.smtp.connectiontimeout:15000}")
    private int connectionTimeout;

    @Value("${spring.mail.properties.mail.smtp.timeout:15000}")
    private int timeout;

    @Value("${spring.mail.properties.mail.smtp.writetimeout:15000}")
    private int writeTimeout;


    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setProtocol(protocol); // Set protocol

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttlsEnable);
        props.put("mail.smtp.starttls.required", starttlsRequired);
        props.put("mail.smtp.ssl.enable", sslEnable); // Explicitly set SSL enable
        props.put("mail.smtp.ssl.trust", sslTrust);

        // Set timeouts
        props.put("mail.smtp.connectiontimeout", connectionTimeout);
        props.put("mail.smtp.timeout", timeout);
        props.put("mail.smtp.writetimeout", writeTimeout);

        // Debug property (can be set in application.properties as spring.mail.debug=true)
        // props.put("mail.debug", "true");

        return mailSender;
    }
}