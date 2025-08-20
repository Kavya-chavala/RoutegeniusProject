package com.routegenius.logistics.service;
// src/main/java/com/routegenius/logistics/service/EmailService.java


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender; // Spring's email sender utility

    // Method to send a simple text email
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("routegeniusproject@gmail.com"); // IMPORTANT: This must match your spring.mail.username in application.properties
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            // Log the full stack trace for more details in development
            e.printStackTrace();
        }
    }

    // You can add more complex methods here later for HTML emails, attachments, etc.
}