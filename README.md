# Intelligent Enterprise Operations & Decision Platform (IEODP)

## Enterprise Workflow Platform

The **Intelligent Enterprise Operations & Decision Platform (IEODP)** is a next-generation, AI-enhanced workflow automation and decision-making platform designed to streamline enterprise operations, enforce governance, simplify approval workflows, and provide real-time insights across organizational teams.

IEODP unifies workflow lifecycle management, role-based decision control, and data-driven operational intelligence into one cohesive system. It enables organizations to automate repetitive processes, create transparent audit trails, integrate external services, and empower teams with actionable analytics.

---

## Project Structure

This project consists of three main components:

1.  **[Java Backend](./ieodp-enterprise-backend-java)**: A robust Spring Boot engine handling core business logic, **JWT-based Authentication** with refresh token rotation, Role-Based Access Control (RBAC), and workflow state management.
2.  **[Python Service](./Python-Service)**: A high-performance FastAPI service dedicated to AI-driven operations, including anomaly detection, risk evaluation, and complex decision-support algorithms.
3.  **[Frontend](./ieodp-enterprise-frontend)**: A premium enterprise dashboard built with React and Vite, featuring real-time data visualization, responsive layouts, and a seamless user experience for workflow management.

---

## Getting Started

### 1. Java Backend
The Java backend handles authentication, RBAC, and core business workflow logic.

**Prerequisites:** Java 17+, Maven 3.6+, MySQL 8.0+.

1.  Navigate to the directory:
    ```bash
    cd ieodp-enterprise-backend-java
    ```
2.  Update `src/main/resources/application.yaml` with your database credentials.
3.  Build the project:
    ```bash
    mvn clean install
    ```
4.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *Starts on: http://localhost:8080*

**Default Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

---

### 2. Python Service
The Python service provides anomaly detection and decision evaluation capabilities.

**Prerequisites:** Python 3.10+, pip.

1.  Navigate to the directory:
    ```bash
    cd Python-Service
    ```
2.  Activate virtual environment (Windows):
    ```bash
    venv\Scripts\activate
    ```
3.  Run the service:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *Starts on: http://localhost:8000*

---

### 3. Frontend
The UI provides an interactive dashboard for managing workflows and users.

**Prerequisites:** Node.js, npm.

1.  Navigate to the directory:
    ```bash
    cd ieodp-enterprise-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    *Starts on: http://localhost:5173 (usually)*

---

## API Documentation & Interfaces

- **Java Backend (Swagger)**: http://localhost:8080/swagger-ui/index.html
- **Python Service (Swagger)**: http://localhost:8000/docs
- **Frontend UI Dashboard**: http://localhost:5173
