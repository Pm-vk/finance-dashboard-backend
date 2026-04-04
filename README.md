# Zorvyn Finance Dashboard - Submission Guide

Welcome to the **Finance Data Processing and Access Control Backend**. This project was built to exceed the specific requirements of the Zorvyn Technical Challenge.

## 🚀 Architecture Overview
The system follows a **Service-Controller-Route** pattern, ensuring a clean separation of concerns:
- **Models**: MongoDB schemas optimized for financial transactions and security (using `mongoose`).
- **Services**: Atomic business logic (Transfers, Dashboard Analytics, Logging).
- **Controllers**: Thin handlers that leverage `asyncHandler` and `ApiResponse` utilities.
- **Middleware**: Guarding the app with **JWT Authentication**, **Role-Based Access Control (RBAC)**, and **Rate Limiting**.

---

## 🔑 Core Features & Assignment Requirements

### 1. User & Role Management (RBAC)
- **Roles**: `Viewer`, `Analyst`, and `Admin`.
- **Status Control**: Admins can deactivate accounts (`active` / `inactive`). Inactive accounts are blocked instantly by `authMiddleware`.
- **Logic**: Enforced via `role.middleware.js` using a declarative `authorize(['Role'])` pattern.

### 2. Financial Records (Category & Type)
Every financial entry includes:
- **Type**: `income`, `expense`, or `transfer`.
- **Category**: (e.g., `Salary`, `Food`, `Rent`, `Investment`).
- **Meta**: Amount, Date, Notes, and a unique `idempotencyKey`.

### 3. Dashboard Summary APIs (Aggregated Data)
The `DashboardService` uses high-performance **MongoDB Aggregation Pipelines** to provide:
- **Total Income** & **Total Expenses**.
- **Net Balance**.
- **Category-wise Breakdown** (e.g., Total spent on 'Food' vs 'Rent').
- **Recent Activity**.

---

## 🛡️ "Above & Beyond" Implementation
In addition to the core requirements, I have implemented industry-standard security and resilience:
- **API Idempotency**: Using `x-idempotency-key` to prevent duplicate transactions during network retries.
- **Rate Limiting**: Global and Transfer-specific throttling to prevent brute-force/spam.
- **Database Logging**: A separate audit trail (`logs` collection) tracking every successful/failed transaction and security event.
- **Standardized Error Handling**: A global `ApiError` class ensures the API never crashes and always returns consistent JSON.

---

## 🧪 Testing Guide (Postman)

### 1. Register & Role Setup
1. Register a user at `POST /api/auth/register`.
2. (Demo Assumption): Users default to `Viewer`. Use an Admin account (or update the DB) to change a user to `Admin` to test management features.

### 2. Operational Flow
- **Analyst**: Can `GET /api/dashboard/summary` and `POST /api/account/deposit`.
- **Viewer**: Can only `GET /api/transactions`.
- **Admin**: Can `PATCH /api/admin/users` to change roles.

### 3. Analytics
- Call `GET /api/dashboard/summary` to see the category breakdown after making several deposits (income) and withdrawals (expenses).

---

## 🛠️ Tech Stack
- **Node.js & Express 5** (Latest performance & routing).
- **MongoDB & Mongoose** (Aggregation & ACID Transactions).
- **Zod** (Type-safe input validation).
- **JWT** (Stateless authentication).

---

Developed by **Prashant Mishra** for the Zorvyn Assignment Portal.
