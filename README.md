# TrekOne Backend

A scalable and production-ready RESTful backend for the **TrekOne Adventure Trek Booking Platform**, built using **Node.js** and **Express.js**. It provides secure authentication, trek & booking management, Razorpay payment processing, email notifications, and automated deployment using Docker and GitHub Actions.

---

## Features

- User Registration & Login
- JWT Authentication with Refresh Token
- Role-Based Authorization (Admin & Customer)
- Forgot & Reset Password
- Trek & Batch Management
- Booking Management
- Razorpay Payment Gateway Integration
- Razorpay Webhook Verification
- Booking Cancellation & Refund Workflow
- Email Notifications (Nodemailer)
- RESTful APIs
- MongoDB Atlas Integration
- CORS Configuration
- Docker Containerization

---

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- BCrypt
- Razorpay
- Nodemailer
- CORS
- Docker
- GitHub Actions
- Nginx
- Git

---

## Architecture

```
Routes
    │
Controllers
    │
Services
    │
Models
    │
MongoDB Atlas
```

---

## Security

- JWT Access & Refresh Token Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Protected REST APIs
- CORS Configuration

---

## DevOps & Deployment

- Docker Containerization
- GitHub Actions CI/CD Pipeline
- Automatic Deployment to Hostinger VPS
- Nginx Reverse Proxy
- Render Deployment
- Environment-Based Configuration

---

## Run Locally

```bash
git clone https://github.com/divinearcs1-star/trekone-backend.git

cd trekone-backend

npm install

npm start
```
## Environment Variables

Copy the example file and update the values:

```bash
cp .env.example .env
```
Configure all required environment variables before running the application.

## Highlights

- RESTful API Development with Express.js
- Clean Layered Architecture
- MongoDB Atlas Integration
- Secure JWT Authentication
- Razorpay Payment & Webhook Integration
- Booking Cancellation & Refund Processing
- Dockerized Deployment
- Automated CI/CD using GitHub Actions
- Production Deployment on Hostinger VPS & Render

---

## Author
Pankaj Belote