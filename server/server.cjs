const express = require('express');
const cors = require('cors');
const pool = require('./db.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key'; // In production, this should be an environment variable

// Date utils for consistent date formatting
const dateUtils = {
  formatDate: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Run initial database schema check and update if needed
(async function initDatabase() {
  try {
    // Check if my_turn column needs to be updated from BOOLEAN to INT
    const [columns] = await pool.query(`
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'gam3eya_financial_harmony' 
      AND TABLE_NAME = 'gam3eyas' 
      AND COLUMN_NAME = 'my_turn'
    `);
    
    // If my_turn is a boolean, alter it to be an INT
    if (columns.length > 0 && columns[0].DATA_TYPE.toLowerCase() === 'tinyint') {
      console.log('Updating my_turn column from BOOLEAN to INT...');
      await pool.query(`
        ALTER TABLE gam3eyas 
        MODIFY COLUMN my_turn INT NULL
      `);
      console.log('Successfully updated gam3eyas table structure.');
    }
    
    // Check if reminders table exists, create it if it doesn't
    try {
      await pool.query(`
        SELECT 1 FROM reminders LIMIT 1
      `);
      console.log('Reminders table exists.');
    } catch (error) {
      console.log('Creating reminders table...');
      await pool.query(`
        CREATE TABLE reminders (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          notes TEXT,
          completed TINYINT(1) DEFAULT 0,
          user_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Successfully created reminders table.');
    }
    
    // Check if scheduled_payments table exists, create it if it doesn't
    try {
      await pool.query(`
        SELECT 1 FROM scheduled_payments LIMIT 1
      `);
      console.log('Scheduled payments table exists.');
    } catch (error) {
      console.log('Creating scheduled_payments table...');
      await pool.query(`
        CREATE TABLE scheduled_payments (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          wallet_id VARCHAR(50) NOT NULL,
          category_id VARCHAR(50) NOT NULL,
          recurring ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') DEFAULT 'none',
          completed TINYINT(1) DEFAULT 0,
          user_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (wallet_id) REFERENCES wallets(id),
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);
      console.log('Successfully created scheduled_payments table.');
    }
  } catch (error) {
    console.error('Error checking or updating database schema:', error);
  }
})();

app.use(cors());
app.use(express.json());

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate a unique user ID
    const userId = `user_${Date.now()}`;
    
    // Insert the new user
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword]
    );
    
    // Create a JWT token
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      user: {
        id: userId,
        username,
        email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Create a JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Wallets endpoints
app.get('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wallets WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

app.post('/api/wallets', authenticateToken, async (req, res) => {
  try {
    const { id, name, balance, type, color, icon } = req.body;
    await pool.query(
      'INSERT INTO wallets (id, name, balance, type, color, icon, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, balance, type, color, icon, req.user.id]
    );
    res.status(201).json({ message: 'Wallet created successfully' });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

app.put('/api/wallets/:id', authenticateToken, async (req, res) => {
  try {
    const { name, balance, type, color, icon } = req.body;
    
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE wallets SET name = ?, balance = ?, type = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
      [name, balance, type, color, icon, req.params.id, req.user.id]
    );
    res.json({ message: 'Wallet updated successfully' });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

app.delete('/api/wallets/:id', authenticateToken, async (req, res) => {
  try {
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    await pool.query('DELETE FROM wallets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

// Categories endpoints
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    // Get both system categories (user_id is NULL) and user-specific categories
    const [rows] = await pool.query('SELECT * FROM categories WHERE user_id IS NULL OR user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { id, name, icon, type, color, isCustom } = req.body;
    await pool.query(
      'INSERT INTO categories (id, name, icon, type, color, is_custom, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, icon, type, color, isCustom ? 1 : 0, req.user.id]
    );
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Transactions endpoints
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, c.name as category_name 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC
    `, [req.user.id]);
    
    // Transform rows to match the expected format in the frontend
    const transformedRows = rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category_id,
      categoryName: row.category_name,
      description: row.description,
      date: row.date.toISOString().split('T')[0],
      walletId: row.wallet_id,
      receiptUrl: row.receipt_url
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { id, amount, type, category, description, date, walletId, receiptUrl } = req.body;
    
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [walletId, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the transaction
      await connection.query(
        'INSERT INTO transactions (id, amount, type, category_id, description, date, wallet_id, receipt_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, amount, type, category, description, date, walletId, receiptUrl, req.user.id]
      );
      
      // Update the wallet balance
      if (type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ? AND user_id = ?', [amount, walletId, req.user.id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ? AND user_id = ?', [amount, walletId, req.user.id]);
      }
      
      // If it's an expense, update the related budget's spent amount
      if (type === 'expense') {
        // Check if there's a budget for this category
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?', [category, req.user.id]);
        if (budgetRows.length > 0) {
          // Update the budget's spent amount
          await connection.query(
            'UPDATE budgets SET spent = spent + ? WHERE category_id = ? AND user_id = ?', 
            [amount, category, req.user.id]
          );
        }
      }
      
      await connection.commit();
      res.status(201).json({ message: 'Transaction created successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { amount, type, category, description, date, walletId, receiptUrl } = req.body;
    const oldTransactionId = req.params.id;
    
    // Verify the transaction belongs to the user
    const [oldTransRows] = await pool.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [oldTransactionId, req.user.id]);
    if (oldTransRows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or not authorized' });
    }
    
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [walletId, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    const oldTransaction = oldTransRows[0];
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query(
        'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ?, wallet_id = ?, receipt_url = ? WHERE id = ? AND user_id = ?',
        [amount, type, category, description, date, walletId, receiptUrl, oldTransactionId, req.user.id]
      );
      
      // Update wallet balance
      if (oldTransaction.type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ? AND user_id = ?', 
          [parseFloat(oldTransaction.amount), oldTransaction.wallet_id, req.user.id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ? AND user_id = ?', 
          [parseFloat(oldTransaction.amount), oldTransaction.wallet_id, req.user.id]);
      }
      
      if (type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ? AND user_id = ?', [amount, walletId, req.user.id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ? AND user_id = ?', [amount, walletId, req.user.id]);
      }
      
      // Update budgets
      // If the old transaction was an expense, reduce the budget spent
      if (oldTransaction.type === 'expense') {
        const [oldBudgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?', [oldTransaction.category_id, req.user.id]);
        if (oldBudgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent - ? WHERE category_id = ? AND user_id = ?', 
            [parseFloat(oldTransaction.amount), oldTransaction.category_id, req.user.id]
          );
        }
      }
      
      // If the new transaction is an expense, increase the budget spent
      if (type === 'expense') {
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?', [category, req.user.id]);
        if (budgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent + ? WHERE category_id = ? AND user_id = ?', 
            [amount, category, req.user.id]
          );
        }
      }
      
      await connection.commit();
      res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Verify the transaction belongs to the user
    const [transRows] = await pool.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [transactionId, req.user.id]);
    if (transRows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or not authorized' });
    }
    
    const transaction = transRows[0];
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, req.user.id]);
      
      // Update wallet balance
      if (transaction.type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ? AND user_id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id, req.user.id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ? AND user_id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id, req.user.id]);
      }
      
      // If it was an expense, update the related budget
      if (transaction.type === 'expense') {
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?', [transaction.category_id, req.user.id]);
        if (budgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent - ? WHERE category_id = ? AND user_id = ?', 
            [parseFloat(transaction.amount), transaction.category_id, req.user.id]
          );
        }
      }
      
      await connection.commit();
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Budgets endpoints
app.get('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as category_name 
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `, [req.user.id]);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      category: row.category_id,
      categoryName: row.category_name,
      amount: parseFloat(row.amount),
      spent: parseFloat(row.spent),
      period: row.period,
      startDate: row.start_date ? row.start_date.toISOString().split('T')[0] : null,
      endDate: row.end_date ? row.end_date.toISOString().split('T')[0] : null
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const { id, category, amount, spent, period, startDate, endDate } = req.body;
    
    // First check if a budget already exists for this category and user
    const [existingBudgets] = await pool.query('SELECT * FROM budgets WHERE category_id = ? AND user_id = ?', [category, req.user.id]);
    if (existingBudgets.length > 0) {
      return res.status(400).json({ error: 'A budget for this category already exists' });
    }
    
    // Calculate initial spent amount from existing transactions
    let initialSpent = spent || 0;
    if (!spent) {
      const [transactionRows] = await pool.query(
        'SELECT SUM(amount) as total FROM transactions WHERE category_id = ? AND type = "expense" AND user_id = ?', 
        [category, req.user.id]
      );
      if (transactionRows[0].total) {
        initialSpent = parseFloat(transactionRows[0].total);
      }
    }
    
    await pool.query(
      'INSERT INTO budgets (id, category_id, amount, spent, period, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, category, amount, initialSpent, period, startDate, endDate, req.user.id]
    );
    
    res.status(201).json({ 
      message: 'Budget created successfully',
      budget: {
        id,
        category,
        amount,
        spent: initialSpent,
        period,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Gam3eyas endpoints
app.get('/api/gam3eyas', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gam3eyas WHERE user_id = ?', [req.user.id]);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      totalAmount: parseFloat(row.total_amount),
      contributionAmount: parseFloat(row.contribution_amount),
      members: row.members,
      startDate: dateUtils.formatDate(row.start_date),
      endDate: dateUtils.formatDate(row.end_date),
      currentCycle: row.current_cycle,
      totalCycles: row.total_cycles,
      isAdmin: !!row.is_admin,
      nextPaymentDate: dateUtils.formatDate(row.next_payment_date),
      myTurn: row.my_turn === null ? null : Number(row.my_turn),
      paidCycles: row.paid_cycles ? JSON.parse(row.paid_cycles) : [],
      receivedPayout: !!row.received_payout
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching gam3eyas:', error);
    res.status(500).json({ error: 'Failed to fetch gam3eyas' });
  }
});

app.post('/api/gam3eyas', authenticateToken, async (req, res) => {
  try {
    const { 
      id, 
      name, 
      totalAmount, 
      contributionAmount, 
      members, 
      startDate, 
      endDate, 
      currentCycle, 
      totalCycles, 
      isAdmin, 
      nextPaymentDate,
      myTurn,
      paidCycles,
      receivedPayout
    } = req.body;
    
    await pool.query(
      'INSERT INTO gam3eyas (id, name, total_amount, contribution_amount, members, start_date, end_date, current_cycle, total_cycles, is_admin, next_payment_date, my_turn, paid_cycles, received_payout, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate, myTurn, paidCycles ? JSON.stringify(paidCycles) : '[]', receivedPayout || false, req.user.id]
    );
    
    res.status(201).json({ message: 'Gam3eya created successfully' });
  } catch (error) {
    console.error('Error creating gam3eya:', error);
    res.status(500).json({ error: 'Failed to create gam3eya' });
  }
});

app.put('/api/gam3eyas/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      totalAmount, 
      contributionAmount, 
      members, 
      startDate, 
      endDate, 
      currentCycle, 
      totalCycles, 
      isAdmin, 
      nextPaymentDate,
      myTurn,
      paidCycles,
      receivedPayout
    } = req.body;
    
    // Verify the gam3eya belongs to the user
    const [gam3eyaRows] = await pool.query('SELECT * FROM gam3eyas WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (gam3eyaRows.length === 0) {
      return res.status(404).json({ error: 'Gam3eya not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE gam3eyas SET name = ?, total_amount = ?, contribution_amount = ?, members = ?, start_date = ?, end_date = ?, current_cycle = ?, total_cycles = ?, is_admin = ?, next_payment_date = ?, my_turn = ?, paid_cycles = ?, received_payout = ? WHERE id = ? AND user_id = ?',
      [name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate, myTurn, paidCycles ? JSON.stringify(paidCycles) : '[]', receivedPayout || false, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Gam3eya updated successfully' });
  } catch (error) {
    console.error('Error updating gam3eya:', error);
    res.status(500).json({ error: 'Failed to update gam3eya' });
  }
});

app.delete('/api/gam3eyas/:id', authenticateToken, async (req, res) => {
  try {
    // Verify the gam3eya belongs to the user
    const [gam3eyaRows] = await pool.query('SELECT * FROM gam3eyas WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (gam3eyaRows.length === 0) {
      return res.status(404).json({ error: 'Gam3eya not found or not authorized' });
    }
    
    // First, delete any payments related to this gam3eya
    await pool.query('DELETE FROM gam3eya_payments WHERE gam3eya_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    // Then delete the gam3eya
    await pool.query('DELETE FROM gam3eyas WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    res.json({ message: 'Gam3eya deleted successfully' });
  } catch (error) {
    console.error('Error deleting gam3eya:', error);
    res.status(500).json({ error: 'Failed to delete gam3eya' });
  }
});

// Gam3eya Payments endpoints
app.post('/api/gam3eya-payments', authenticateToken, async (req, res) => {
  try {
    const { id, gam3eyaId, walletId, amount, date, cycle, type } = req.body;
    
    // Verify the gam3eya belongs to the user
    const [gam3eyaRows] = await pool.query('SELECT * FROM gam3eyas WHERE id = ? AND user_id = ?', [gam3eyaId, req.user.id]);
    if (gam3eyaRows.length === 0) {
      return res.status(404).json({ error: 'Gam3eya not found or not authorized' });
    }
    
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [walletId, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the payment
      await connection.query(
        'INSERT INTO gam3eya_payments (id, gam3eya_id, wallet_id, amount, date, cycle, type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, gam3eyaId, walletId, amount, date, cycle, type, req.user.id]
      );
      
      // We're removing the wallet balance update from here because it's handled by the transaction creation
      // in the frontend (src/pages/Gam3eya.tsx)
      
      // Update gam3eya's paid cycles and other state
      if (type === 'payment') {
        // Update gam3eya's paid cycles
        const [gam3eyaRows] = await connection.query('SELECT * FROM gam3eyas WHERE id = ? AND user_id = ?', [gam3eyaId, req.user.id]);
        if (gam3eyaRows.length > 0) {
          const gam3eya = gam3eyaRows[0];
          const paidCycles = gam3eya.paid_cycles ? JSON.parse(gam3eya.paid_cycles) : [];
          
          if (!paidCycles.includes(cycle)) {
            paidCycles.push(cycle);
            
            // Update the gam3eya record with paid cycles and increment current cycle
            await connection.query(
              'UPDATE gam3eyas SET paid_cycles = ?, current_cycle = ? WHERE id = ? AND user_id = ?',
              [JSON.stringify(paidCycles), Math.max(gam3eya.current_cycle, cycle), gam3eyaId, req.user.id]
            );
          }
        }
      } else if (type === 'payout') {
        // Mark as received in gam3eya
        await connection.query('UPDATE gam3eyas SET received_payout = ? WHERE id = ? AND user_id = ?', [true, gam3eyaId, req.user.id]);
      }
      
      await connection.commit();
      res.status(201).json({ message: 'Gam3eya payment processed successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error processing gam3eya payment:', error);
    res.status(500).json({ error: 'Failed to process gam3eya payment' });
  }
});

app.get('/api/gam3eya-payments/:gam3eyaId', authenticateToken, async (req, res) => {
  try {
    // Verify the gam3eya belongs to the user
    const [gam3eyaRows] = await pool.query('SELECT * FROM gam3eyas WHERE id = ? AND user_id = ?', [req.params.gam3eyaId, req.user.id]);
    if (gam3eyaRows.length === 0) {
      return res.status(404).json({ error: 'Gam3eya not found or not authorized' });
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM gam3eya_payments WHERE gam3eya_id = ? AND user_id = ? ORDER BY date ASC',
      [req.params.gam3eyaId, req.user.id]
    );
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      gam3eyaId: row.gam3eya_id,
      walletId: row.wallet_id,
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0],
      cycle: row.cycle,
      type: row.type
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching gam3eya payments:', error);
    res.status(500).json({ error: 'Failed to fetch gam3eya payments' });
  }
});

// Financial summary endpoint
app.get('/api/financial-summary', authenticateToken, async (req, res) => {
  try {
    const [wallets] = await pool.query('SELECT * FROM wallets WHERE user_id = ?', [req.user.id]);
    const totalBalance = wallets.reduce((acc, wallet) => acc + parseFloat(wallet.balance), 0);
    
    const [income] = await pool.query('SELECT SUM(amount) as totalIncome FROM transactions WHERE type = "income" AND user_id = ?', [req.user.id]);
    const [expenses] = await pool.query('SELECT SUM(amount) as totalExpenses FROM transactions WHERE type = "expense" AND user_id = ?', [req.user.id]);
    
    res.json({
      totalBalance,
      totalIncome: income[0].totalIncome || 0,
      totalExpenses: expenses[0].totalExpenses || 0
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Reminders endpoints
app.get('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reminders WHERE user_id = ? ORDER BY date ASC', [req.user.id]);
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      date: row.date.toISOString().split('T')[0],
      notes: row.notes,
      completed: !!row.completed
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

app.post('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const { id, title, date, notes, completed } = req.body;
    
    await pool.query(
      'INSERT INTO reminders (id, title, date, notes, completed, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, date, notes, completed ? 1 : 0, req.user.id]
    );
    
    res.status(201).json({ message: 'Reminder created successfully' });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

app.put('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const { title, date, notes, completed } = req.body;
    
    // Verify the reminder belongs to the user
    const [reminderRows] = await pool.query('SELECT * FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (reminderRows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE reminders SET title = ?, date = ?, notes = ?, completed = ? WHERE id = ? AND user_id = ?',
      [title, date, notes, completed ? 1 : 0, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Reminder updated successfully' });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

app.patch('/api/reminders/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.body;
    
    // Verify the reminder belongs to the user
    const [reminderRows] = await pool.query('SELECT * FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (reminderRows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE reminders SET completed = ? WHERE id = ? AND user_id = ?',
      [completed ? 1 : 0, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Reminder status updated successfully' });
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ error: 'Failed to update reminder status' });
  }
});

app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    // Verify the reminder belongs to the user
    const [reminderRows] = await pool.query('SELECT * FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (reminderRows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found or not authorized' });
    }
    
    await pool.query('DELETE FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Scheduled Payments endpoints
app.get('/api/scheduled-payments', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sp.*, c.name as category_name, w.name as wallet_name
      FROM scheduled_payments sp
      JOIN categories c ON sp.category_id = c.id
      JOIN wallets w ON sp.wallet_id = w.id
      WHERE sp.user_id = ?
      ORDER BY sp.date ASC
    `, [req.user.id]);
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.title,
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0],
      walletId: row.wallet_id,
      walletName: row.wallet_name,
      categoryId: row.category_id,
      categoryName: row.category_name,
      recurring: row.recurring,
      completed: !!row.completed
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching scheduled payments:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled payments' });
  }
});

app.post('/api/scheduled-payments', authenticateToken, async (req, res) => {
  try {
    const { id, title, amount, date, walletId, categoryId, recurring, completed } = req.body;
    
    // Verify the wallet belongs to the user
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE id = ? AND user_id = ?', [walletId, req.user.id]);
    if (walletRows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }
    
    await pool.query(
      'INSERT INTO scheduled_payments (id, title, amount, date, wallet_id, category_id, recurring, completed, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, amount, date, walletId, categoryId, recurring, completed ? 1 : 0, req.user.id]
    );
    
    res.status(201).json({ message: 'Scheduled payment created successfully' });
  } catch (error) {
    console.error('Error creating scheduled payment:', error);
    res.status(500).json({ error: 'Failed to create scheduled payment' });
  }
});

app.put('/api/scheduled-payments/:id', authenticateToken, async (req, res) => {
  try {
    const { title, amount, date, walletId, categoryId, recurring, completed } = req.body;
    
    // Verify the scheduled payment belongs to the user
    const [paymentRows] = await pool.query('SELECT * FROM scheduled_payments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (paymentRows.length === 0) {
      return res.status(404).json({ error: 'Scheduled payment not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE scheduled_payments SET title = ?, amount = ?, date = ?, wallet_id = ?, category_id = ?, recurring = ?, completed = ? WHERE id = ? AND user_id = ?',
      [title, amount, date, walletId, categoryId, recurring, completed ? 1 : 0, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Scheduled payment updated successfully' });
  } catch (error) {
    console.error('Error updating scheduled payment:', error);
    res.status(500).json({ error: 'Failed to update scheduled payment' });
  }
});

app.patch('/api/scheduled-payments/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.body;
    
    // Verify the scheduled payment belongs to the user
    const [paymentRows] = await pool.query('SELECT * FROM scheduled_payments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (paymentRows.length === 0) {
      return res.status(404).json({ error: 'Scheduled payment not found or not authorized' });
    }
    
    await pool.query(
      'UPDATE scheduled_payments SET completed = ? WHERE id = ? AND user_id = ?',
      [completed ? 1 : 0, req.params.id, req.user.id]
    );
    
    res.json({ message: 'Scheduled payment status updated successfully' });
  } catch (error) {
    console.error('Error updating scheduled payment status:', error);
    res.status(500).json({ error: 'Failed to update scheduled payment status' });
  }
});

app.delete('/api/scheduled-payments/:id', authenticateToken, async (req, res) => {
  try {
    // Verify the scheduled payment belongs to the user
    const [paymentRows] = await pool.query('SELECT * FROM scheduled_payments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (paymentRows.length === 0) {
      return res.status(404).json({ error: 'Scheduled payment not found or not authorized' });
    }
    
    await pool.query('DELETE FROM scheduled_payments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    res.json({ message: 'Scheduled payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled payment:', error);
    res.status(500).json({ error: 'Failed to delete scheduled payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
