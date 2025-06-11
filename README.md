# Gam3eya Financial Harmony

A comprehensive personal finance management application designed specifically for Egyptian users, featuring traditional **Gam3eya** (rotating savings groups) alongside modern financial tracking tools. The application supports bilingual interface (Arabic/English) and provides complete financial management capabilities including transactions, budgets, wallets, reports, and collaborative savings.

## ✨ Key Features

### 🏦 **Core Financial Management**
- **Multi-Wallet Support**: Manage cash, bank accounts, savings, and custom wallets
- **Transaction Tracking**: Record income and expenses with detailed categorization
- **Budget Management**: Set and monitor spending limits by category
- **Financial Reports**: Comprehensive analytics with charts and insights
- **Receipt Management**: Upload and store transaction receipts

### 👥 **Gam3eya (Traditional Savings Groups)**
- **Create & Manage Groups**: Set up rotating savings circles with friends/family
- **Payment Tracking**: Monitor contributions and payout schedules
- **Turn Management**: Track whose turn it is to receive the payout
- **Automated Calculations**: Smart calculation of contribution amounts and dates
- **Payment Integration**: Seamless integration with wallet transactions

### 📊 **Analytics & Reporting**
- **Visual Charts**: Income vs expenses, cash flow analysis, category breakdowns
- **Time-based Views**: Monthly and yearly financial comparisons
- **Wallet Analytics**: Individual wallet transaction history and balance trends
- **Expense Distribution**: Pie charts showing spending patterns
- **Financial Summary**: Real-time overview of total balance, income, and expenses

### 🌐 **User Experience**
- **Bilingual Support**: Full Arabic and English interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Beautiful, intuitive interface using shadcn/ui components
- **Real-time Updates**: Live data synchronization across all features
- **Secure Authentication**: JWT-based user authentication and authorization

### 📅 **Planning & Reminders**
- **Financial Reminders**: Set custom reminders for payments and financial goals
- **Scheduled Payments**: Recurring payment management
- **Date Navigation**: Easy month/year navigation for historical data

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (8.0+ recommended, XAMPP supported)
- **Git** for version control

### Database Setup

1. **Start MySQL Server**
   - If using XAMPP: Start MySQL service from XAMPP control panel
   - Or start your MySQL service via your preferred method

2. **Create Database**
   - Run the provided SQL script: `schema_copy.sql`
   - This will create the `gam3eya_financial_harmony` database with all required tables
   - The script includes sample data for testing

3. **Database Configuration**
   - Default connection settings (in `server/db.cjs`):
     - Host: `localhost`
     - User: `root`
     - Password: (empty)
     - Database: `gam3eya_financial_harmony`
   - Modify these settings if your MySQL setup differs

### Application Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd gam3eya-financial-harmony
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Database connection is configured in `server/db.cjs`
   - JWT secret is set in `server/server.cjs` (change for production)

### Running the Application

**Start both frontend and backend with one command:**
```bash
npm run start
```

This launches:
- **React Frontend**: http://localhost:5173 (Vite dev server)
- **Express API**: http://localhost:3001

**Alternative commands:**
```bash
# Development mode (frontend only)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Wallet Management
- `GET /api/wallets` - Get all user wallets
- `POST /api/wallets` - Create new wallet
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet

### Transaction Management
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Management
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget

### Gam3eya Management
- `GET /api/gam3eyas` - Get user's gam3eyas
- `POST /api/gam3eyas` - Create new gam3eya
- `PUT /api/gam3eyas/:id` - Update gam3eya
- `DELETE /api/gam3eyas/:id` - Delete gam3eya
- `POST /api/gam3eya-payments` - Process gam3eya payment
- `GET /api/gam3eya-payments/:id` - Get gam3eya payment history

### Categories & Reporting
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category
- `GET /api/financial-summary` - Get financial overview

### Reminders & Scheduling
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create reminder
- `GET /api/scheduled-payments` - Get scheduled payments
- `POST /api/scheduled-payments` - Create scheduled payment

## 🏗️ Project Architecture

```
gam3eya-financial-harmony/
├── 📁 server/                 # Backend Express.js application
│   ├── server.cjs            # Main server file with all API routes
│   └── db.cjs               # MySQL database connection
├── 📁 src/                   # Frontend React application
│   ├── 📁 components/        # Reusable UI components
│   │   ├── 📁 ui/            # shadcn/ui base components
│   │   ├── 📁 dashboard/     # Dashboard-specific components
│   │   ├── 📁 gam3eya/       # Gam3eya feature components
│   │   ├── 📁 reports/       # Analytics and reporting
│   │   ├── 📁 transactions/  # Transaction management
│   │   └── 📁 dialogs/       # Modal dialogs
│   ├── 📁 contexts/          # React Context providers
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 pages/             # Application pages/routes
│   ├── 📁 services/          # API service functions
│   ├── 📁 lib/               # Utility functions
│   └── 📁 types/             # TypeScript type definitions
├── 📁 public/                # Static assets
├── schema_copy.sql           # Database schema and sample data
├── start.cjs                 # Application startup script
└── package.json              # Dependencies and scripts
```

## 🛠️ Technology Stack

### Frontend Technologies
- **⚛️ React 18** - Modern React with hooks and functional components
- **📘 TypeScript** - Full type safety and better development experience
- **🎨 Tailwind CSS** - Utility-first CSS framework for responsive design
- **🧩 shadcn/ui** - Beautiful, accessible component library
- **🚦 React Router** - Client-side routing and navigation
- **📋 React Hook Form** - Performant form handling with validation
- **✅ Zod** - TypeScript-first schema validation
- **📊 Recharts** - Composable charting library for data visualization
- **🌐 Axios** - HTTP client for API communication
- **⚡ Vite** - Fast build tool and development server

### Backend Technologies
- **🟢 Express.js** - Web application framework for Node.js
- **🗄️ MySQL2** - MySQL database driver with Promise support
- **🔐 bcryptjs** - Password hashing for secure authentication
- **🎫 jsonwebtoken** - JWT implementation for stateless authentication
- **🌐 CORS** - Cross-Origin Resource Sharing middleware
- **📅 date-fns** - Modern JavaScript date utility library

### Development Tools
- **📦 ESLint** - Code linting and formatting
- **🎯 TypeScript Compiler** - Type checking and compilation
- **🔧 PostCSS** - CSS processing and optimization
- **📱 Responsive Design** - Mobile-first approach with Tailwind

## 🌍 Localization

The application supports full bilingual functionality:
- **Arabic (العربية)**: Complete RTL (Right-to-Left) support
- **English**: Default interface language
- **Dynamic Switching**: Users can toggle between languages instantly
- **Persistent Settings**: Language preference is saved locally

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt for secure password storage
- **Request Authorization**: Protected API endpoints with middleware
- **Input Validation**: Comprehensive validation using Zod schemas
- **CORS Configuration**: Properly configured cross-origin requests

## 📊 Sample Data

The application includes comprehensive sample data for testing:
- **Demo User**: Pre-configured test user with sample transactions
- **Multiple Wallets**: Cash, bank account, savings, and gam3eya wallets
- **Transaction History**: Various income and expense transactions
- **Budget Examples**: Pre-set budgets for different categories
- **Gam3eya Groups**: Sample rotating savings groups
- **Financial Reports**: Rich data for testing analytics features

## 🎯 User Guide

### Getting Started
1. **Register/Login**: Create an account or use demo credentials
2. **Setup Wallets**: Add your cash, bank accounts, and other financial sources
3. **Record Transactions**: Start tracking your income and expenses
4. **Set Budgets**: Create spending limits for different categories
5. **Join/Create Gam3eyas**: Participate in traditional savings groups

### Gam3eya Usage
1. **Create Group**: Set total amount, number of members, and start date
2. **Configure Turn**: Specify which cycle you'll receive the payout
3. **Make Payments**: Regular monthly contributions to the group
4. **Track Progress**: Monitor payment status and upcoming turns
5. **Receive Payout**: Collect your turn when the time comes

## 🤝 Contributing

This project follows modern development practices:
- **TypeScript**: Full type safety throughout the codebase
- **Component Architecture**: Modular, reusable component design
- **API Design**: RESTful API with consistent error handling
- **Database Design**: Normalized schema with proper relationships
- **Security**: Industry-standard authentication and authorization

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.
