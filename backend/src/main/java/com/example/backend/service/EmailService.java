package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String content) {
        if (mailSender == null) {
            System.out.println("❌ Mail Sender not configured. Skipping email to " + to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }

    public void sendRideConfirmationEmail(String to, com.example.backend.model.Ride ride, com.example.backend.model.User driver, com.example.backend.model.Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(to.split("@")[0]).append(",\n\n");
        sb.append("Good news! Your ride request has been ACCEPTED by the driver.\n\n");
        sb.append("🔹 RIDE DETAILS:\n");
        sb.append("   • From: ").append(ride.getFromLocation()).append("\n");
        sb.append("   • To:   ").append(ride.getToLocation()).append("\n");
        sb.append("   • Date: ").append(ride.getDate()).append("\n");
        sb.append("   • Time: ").append(ride.getTime()).append("\n\n");
        sb.append("🔹 DRIVER INFO:\n");
        sb.append("   • Name:  ").append(driver != null ? driver.getName() : ride.getDriverName()).append("\n");
        sb.append("   • Phone: ").append(driver != null ? driver.getPhone() : ride.getDriverPhone()).append("\n");
        sb.append("   • Car:   ").append(driver != null ? driver.getCarModel() : ride.getVehicleType()).append("\n\n");
        sb.append("🔹 PAYMENT:\n");
        sb.append("   • Cost:  ₹").append(booking.getTotalPrice()).append("\n");
        sb.append("   • Status: ").append(booking.getPaymentStatus()).append("\n\n");
        sb.append("Safe travels!\n");
        sb.append("- RideConnect Team");

        String subject = "Ride Confirmed! 🚗 Route: " + ride.getFromLocation() + " -> " + ride.getToLocation();
        
        // Use the existing sendEmail method which handles the actual sending
        sendEmail(to, subject, sb.toString());
    }

    public void sendPaymentReceivedEmail(String to, com.example.backend.model.Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(to.split("@")[0]).append(",\n\n");
        sb.append("Payment Successful! 💰\n\n");
        sb.append("We have received your payment of ₹").append(booking.getTotalPrice()).append(".\n");
        sb.append("Your ride from ").append(booking.getPickupLocation());
        sb.append(" to ").append(booking.getDropoffLocation()).append(" is now officially CONFIRMED.\n\n");
        sb.append("Thank you for choosing RideConnect!\n");
        sb.append("- RideConnect Team");

        String subject = "Payment Receipt: ₹" + booking.getTotalPrice();
        sendEmail(to, subject, sb.toString());
    }
}
