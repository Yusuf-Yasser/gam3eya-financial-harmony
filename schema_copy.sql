
-- Create the database
CREATE DATABASE IF NOT EXISTS gam3eya_financial_harmony;
USE gam3eya_financial_harmony;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    type ENUM('income', 'expense', 'both') DEFAULT 'both',
    user_id VARCHAR(50),
    is_custom BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    type ENUM('cash', 'bank', 'savings', 'gam3eya', 'custom') NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    wallet_id VARCHAR(50) NOT NULL,
    receipt_url TEXT,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    period ENUM('monthly', 'weekly', 'yearly', 'custom') NOT NULL,
    start_date DATE,
    end_date DATE,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create gam3eyas table with additional columns
CREATE TABLE IF NOT EXISTS gam3eyas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    contribution_amount DECIMAL(10, 2) NOT NULL,
    members INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_cycle INT NOT NULL,
    total_cycles INT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    next_payment_date DATE NOT NULL,
    my_turn INT DEFAULT NULL,
    paid_cycles TEXT DEFAULT '[]',
    received_payout BOOLEAN DEFAULT false,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create gam3eya_payments table
CREATE TABLE IF NOT EXISTS gam3eya_payments (
    id VARCHAR(50) PRIMARY KEY,
    gam3eya_id VARCHAR(50) NOT NULL,
    wallet_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    cycle INT NOT NULL,
    type ENUM('payment', 'payout') NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (gam3eya_id) REFERENCES gam3eyas(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert a default user for testing
INSERT INTO users (id, username, email, password_hash) VALUES
('user_1', 'testuser', 'test@example.com', '$2a$10$JI3BQblGOj9Q9r4Kqo8wq.rk9OFNKRd7YzBGPwg9KQaFr5R3kJUci');

-- Insert dummy categories (now associated with user_1)
INSERT INTO categories (id, name, icon, type, user_id) VALUES
('food', 'food', 'utensils', 'expense', 'user_1'),
('transport', 'transport', 'car', 'expense', 'user_1'),
('housing', 'housing', 'home', 'expense', 'user_1'),
('utilities', 'utilities', 'lightbulb', 'expense', 'user_1'),
('healthcare', 'healthcare', 'heart', 'expense', 'user_1'),
('personal', 'personal', 'user', 'expense', 'user_1'),
('entertainment', 'entertainment', 'tv', 'expense', 'user_1'),
('education', 'education', 'book', 'expense', 'user_1'),
('debt', 'debt', 'credit-card', 'expense', 'user_1'),
('other', 'other', 'ellipsis-h', 'both', 'user_1'),
('gam3eya', 'Gam3eya Payment', 'group', 'expense', 'user_1');

-- Insert dummy wallets (now associated with user_1)
INSERT INTO wallets (id, name, balance, type, color, user_id) VALUES
('w1', 'Cash', 5000, 'cash', '#83C5BE', 'user_1'),
('w2', 'Bank Account', 15000, 'bank', '#006D77', 'user_1'),
('w3', 'Savings', 10000, 'savings', '#E29578', 'user_1'),
('w4', 'Family Gam3eya', 8000, 'gam3eya', '#FFDDD2', 'user_1');

-- Insert dummy transactions (now associated with user_1)
INSERT INTO transactions (id, amount, type, category_id, description, date, wallet_id, user_id) VALUES
('t1', 500, 'expense', 'food', 'Grocery shopping', '2025-03-15', 'w1', 'user_1'),
('t2', 1000, 'expense', 'transport', 'Uber rides', '2025-03-14', 'w1', 'user_1'),
('t3', 10000, 'income', 'other', 'Salary', '2025-03-01', 'w2', 'user_1'),
('t4', 2000, 'expense', 'entertainment', 'Cinema tickets', '2025-03-10', 'w2', 'user_1'),
('t5', 3000, 'expense', 'housing', 'Rent', '2025-03-05', 'w2', 'user_1'),
('t6', 2000, 'income', 'other', 'Freelance work', '2025-03-12', 'w3', 'user_1'),
('t7', 450, 'expense', 'food', 'Grocery shopping', '2025-02-15', 'w1', 'user_1'),
('t8', 950, 'expense', 'transport', 'Uber rides', '2025-02-14', 'w1', 'user_1'),
('t9', 9500, 'income', 'other', 'Salary', '2025-02-01', 'w2', 'user_1'),
('t10', 1800, 'expense', 'entertainment', 'Cinema tickets', '2025-02-10', 'w2', 'user_1');

-- Insert dummy budgets (now associated with user_1)
INSERT INTO budgets (id, category_id, amount, spent, period, user_id) VALUES
('b1', 'food', 2000, 1200, 'monthly', 'user_1'),
('b2', 'transport', 1500, 1000, 'monthly', 'user_1'),
('b3', 'entertainment', 3000, 2000, 'monthly', 'user_1');

-- Insert dummy gam3eyas (now associated with user_1)
INSERT INTO gam3eyas (id, name, total_amount, contribution_amount, members, start_date, end_date, current_cycle, total_cycles, is_admin, next_payment_date, user_id) VALUES
('g1', 'Family Gam3eya', 80000, 2000, 10, '2025-01-01', '2025-10-31', 3, 10, true, '2025-03-31', 'user_1'),
('g2', 'Friends Gam3eya', 60000, 1500, 8, '2025-01-01', '2025-08-31', 3, 8, false, '2025-03-25', 'user_1');
