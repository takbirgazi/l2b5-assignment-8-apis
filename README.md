# 💸 No Cash – Digital Wallet System API

No Cash is a secure, modular, and role-based **RESTful API** for a digital wallet platform (like **Bkash** or **Nagad**), built using **Node.js**, **Express**, and **MongoDB (Mongoose)**. It allows **users**, **agents**, and **admins** to perform and manage core financial operations like adding, sending, withdrawing money, and viewing transactions — all with strict access control and audit-ready logging.

---

## 🌐 API Base URL

> **https://no-cash.vercel.app/**

---

## 🚀 Table of Contents

- [✨ Features](#-features)
- [🛠️ Technologies Used](#-technologies-used)
- [📁 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
  - [🔧 Prerequisites](#-prerequisites)
  - [📥 Installation](#-installation)
  - [📄 Environment Variables](#-environment-variables)
  - [🚀 Running the Server](#-running-the-server)
- [🔐 Role-Based Functionalities](#-role-based-functionalities)
- [📦 API Endpoints Summary](#-api-endpoints-summary)
- [🧪 Testing with Postman](#-testing-with-postman)
- [🎥 Project Walkthrough (For Submission)](#-project-walkthrough-for-submission)
- [📈 Future Enhancements](#-future-enhancements)
- [🧑 Author](#-author)

---

## 📦 API Endpoints Summary

### **User APIs**
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/v1/user/register`               | Register a new user          |
| GET    | `/api/v1/user/me`                     | Get current user profile     |
| GET    | `/api/v1/user/all-users`              | Get all users                |
| GET    | `/api/v1/user/:id`                    | Get user by ID               |
| PATCH  | `/api/v1/user/:id`                    | Update user by ID            |

### **Auth APIs**
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/v1/auth/login`                  | User login                   |
| POST   | `/api/v1/auth/refresh-token`          | Refresh JWT token            |
| POST   | `/api/v1/auth/logout`                 | User logout                  |
| GET    | `/api/v1/auth/google`                 | Google OAuth login           |

### **Wallet APIs**
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| PATCH  | `/api/v1/wallet/cash-out/:email`      | Cash out from wallet         |
| PATCH  | `/api/v1/wallet/cash-in/:email`       | Cash in to wallet            |
| PATCH  | `/api/v1/wallet/send-money/:email`    | Send money to another wallet |
| PATCH  | `/api/v1/wallet/:email`               | Update wallet by email       |

### **Transaction APIs**
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | `/api/v1/transaction/history`         | Get own transaction history  |
| GET    | `/api/v1/transaction/all-history`     | Get all transactions         |

---

## ✨ Features

### 🧑 Users
- 🔐 Register/Login
- 💳 Wallet auto-created on signup (৳50 starting balance)
- ➕ Add money
- ➖ Withdraw money
- 🔄 Send money to another user
- 📜 View own transaction history

### 🧑‍💼 Agents
- 🏧 Cash-in (add money to a user’s wallet)
- 💵 Cash-out (withdraw from a user’s wallet)
- 💰 View commission history (optional)

### 👨‍💼 Admins
- 👥 View all users/agents
- 📂 View all wallets & transactions
- ⛔ Block/unblock user wallets
- ✅ Approve/suspend agents
- ⚙️ Manage transaction settings (optional)

### 🔁 Transactions
- Fully trackable and atomic
- Types: `Cash Out`, `Cash In`, `Send Money`, `Received`
- Fields: amount, fee, commission, type, user, transactionWith

---

## 🛠️ Technologies Used

| Tech              | Purpose                                |
|-------------------|----------------------------------------|
| **Node.js**       | Server-side runtime                    |
| **Express.js**    | Web framework                          |
| **MongoDB**       | NoSQL database                         |
| **Mongoose**      | MongoDB object modeling                |
| **JWT**           | Authentication (access control)        |
| **bcrypt**        | Password hashing                       |
| **dotenv**        | Environment configuration              |
| **Postman**       | API testing/documentation              |

