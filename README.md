# Gam3eya Financial Harmony

A comprehensive financial management application that supports transactions, budgets, wallets, and more.

## Setup Instructions

This application uses React for the frontend and Express with MySQL for the backend.

### Prerequisites

- Node.js (v14 or higher)
- MySQL (XAMPP recommended)
- Git

### Database Setup

1. Start your MySQL server via XAMPP
2. Create the database and tables using the SQL script provided in the project:
   - You can run the SQL script directly in phpMyAdmin or using any MySQL client

### Application Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the database connection:
   - Open `server/db.cjs` and update the MySQL connection settings if needed (default: localhost, user: root, password: empty)

### Running the Application

You can start both the frontend and backend with a single command:

```
npm run start
```

This will start:
- The React frontend on http://localhost:5173
- The Express API server on http://localhost:3001

### API Endpoints

The following API endpoints are available:

- **Wallets**
  - GET `/api/wallets` - Get all wallets
  - POST `/api/wallets` - Create a wallet
  - PUT `/api/wallets/:id` - Update a wallet
  - DELETE `/api/wallets/:id` - Delete a wallet

- **Categories**
  - GET `/api/categories` - Get all categories
  - POST `/api/categories` - Create a category

- **Transactions**
  - GET `/api/transactions` - Get all transactions
  - POST `/api/transactions` - Create a transaction
  - PUT `/api/transactions/:id` - Update a transaction
  - DELETE `/api/transactions/:id` - Delete a transaction

- **Budgets**
  - GET `/api/budgets` - Get all budgets
  - POST `/api/budgets` - Create a budget

- **Financial Summary**
  - GET `/api/financial-summary` - Get financial summary

## Project Structure

- `/server` - Express backend API
- `/src` - React frontend application
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/pages` - Application pages
  - `/services` - API services
  - `/types` - TypeScript type definitions
  - `/lib` - Utility functions

## Technology Stack

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - React Router
  - React Hook Form + Zod
  - Axios

- **Backend**:
  - Express.js
  - MySQL2
  - CORS
