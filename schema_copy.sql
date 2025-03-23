-- Create the database
CREATE DATABASE IF NOT EXISTS gam3eya_financial_harmony;
USE gam3eya_financial_harmony;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    type ENUM('income', 'expense', 'both') DEFAULT 'both'
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    type ENUM('cash', 'bank', 'savings', 'gam3eya', 'custom') NOT NULL,
    color VARCHAR(20),
    icon VARCHAR(50)
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
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
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
    FOREIGN KEY (category_id) REFERENCES categories(id)
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
    paid_cycles TEXT DEFAULT '[]',
    my_turn BOOLEAN DEFAULT false,
    received_payout BOOLEAN DEFAULT false
);

-- Insert dummy categories
INSERT INTO categories (id, name, icon, type) VALUES
('food', 'food', 'utensils', 'expense'),
('transport', 'transport', 'car', 'expense'),
('housing', 'housing', 'home', 'expense'),
('utilities', 'utilities', 'lightbulb', 'expense'),
('healthcare', 'healthcare', 'heart', 'expense'),
('personal', 'personal', 'user', 'expense'),
('entertainment', 'entertainment', 'tv', 'expense'),
('education', 'education', 'book', 'expense'),
('debt', 'debt', 'credit-card', 'expense'),
('other', 'other', 'ellipsis-h', 'both'),
('gam3eya', 'Gam3eya Payment', 'group', 'expense');

-- Insert dummy wallets
INSERT INTO wallets (id, name, balance, type, color) VALUES
('w1', 'Cash', 5000, 'cash', '#83C5BE'),
('w2', 'Bank Account', 15000, 'bank', '#006D77'),
('w3', 'Savings', 10000, 'savings', '#E29578'),
('w4', 'Family Gam3eya', 8000, 'gam3eya', '#FFDDD2');

-- Insert dummy transactions
INSERT INTO transactions (id, amount, type, category_id, description, date, wallet_id) VALUES
('t1', 500, 'expense', 'food', 'Grocery shopping', '2025-03-15', 'w1'),
('t2', 1000, 'expense', 'transport', 'Uber rides', '2025-03-14', 'w1'),
('t3', 10000, 'income', 'other', 'Salary', '2025-03-01', 'w2'),
('t4', 2000, 'expense', 'entertainment', 'Cinema tickets', '2025-03-10', 'w2'),
('t5', 3000, 'expense', 'housing', 'Rent', '2025-03-05', 'w2'),
('t6', 2000, 'income', 'other', 'Freelance work', '2025-03-12', 'w3'),
('t7', 450, 'expense', 'food', 'Grocery shopping', '2025-02-15', 'w1'),
('t8', 950, 'expense', 'transport', 'Uber rides', '2025-02-14', 'w1'),
('t9', 9500, 'income', 'other', 'Salary', '2025-02-01', 'w2'),
('t10', 1800, 'expense', 'entertainment', 'Cinema tickets', '2025-02-10', 'w2');

-- Insert dummy budgets
INSERT INTO budgets (id, category_id, amount, spent, period) VALUES
('b1', 'food', 2000, 1200, 'monthly'),
('b2', 'transport', 1500, 1000, 'monthly'),
('b3', 'entertainment', 3000, 2000, 'monthly');

-- Insert dummy gam3eyas
INSERT INTO gam3eyas (id, name, total_amount, contribution_amount, members, start_date, end_date, current_cycle, total_cycles, is_admin, next_payment_date) VALUES
('g1', 'Family Gam3eya', 80000, 2000, 10, '2025-01-01', '2025-10-31', 3, 10, true, '2025-03-31'),
('g2', 'Friends Gam3eya', 60000, 1500, 8, '2025-01-01', '2025-08-31', 3, 8, false, '2025-03-25');