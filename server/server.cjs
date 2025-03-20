
const express = require('express');
const cors = require('cors');
const pool = require('./db.cjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Wallets endpoints
app.get('/api/wallets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wallets');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

app.post('/api/wallets', async (req, res) => {
  try {
    const { id, name, balance, type, color, icon } = req.body;
    await pool.query(
      'INSERT INTO wallets (id, name, balance, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, balance, type, color, icon]
    );
    res.status(201).json({ message: 'Wallet created successfully' });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

app.put('/api/wallets/:id', async (req, res) => {
  try {
    const { name, balance, type, color, icon } = req.body;
    await pool.query(
      'UPDATE wallets SET name = ?, balance = ?, type = ?, color = ?, icon = ? WHERE id = ?',
      [name, balance, type, color, icon, req.params.id]
    );
    res.json({ message: 'Wallet updated successfully' });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

app.delete('/api/wallets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM wallets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, icon, type } = req.body;
    await pool.query(
      'INSERT INTO categories (id, name, icon, type) VALUES (?, ?, ?, ?)',
      [id, name, icon, type]
    );
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, c.name as category_name 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC
    `);
    
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

app.post('/api/transactions', async (req, res) => {
  try {
    const { id, amount, type, category, description, date, walletId, receiptUrl } = req.body;
    await pool.query(
      'INSERT INTO transactions (id, amount, type, category_id, description, date, wallet_id, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, amount, type, category, description, date, walletId, receiptUrl]
    );
    res.status(201).json({ message: 'Transaction created successfully' });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { amount, type, category, description, date, walletId, receiptUrl } = req.body;
    const oldTransactionId = req.params.id;
    
    const [oldTransRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [oldTransactionId]);
    if (oldTransRows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const oldTransaction = oldTransRows[0];
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query(
        'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ?, wallet_id = ?, receipt_url = ? WHERE id = ?',
        [amount, type, category, description, date, walletId, receiptUrl, oldTransactionId]
      );
      
      if (oldTransaction.type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', 
          [parseFloat(oldTransaction.amount), oldTransaction.wallet_id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', 
          [parseFloat(oldTransaction.amount), oldTransaction.wallet_id]);
      }
      
      if (type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, walletId]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, walletId]);
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

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    const [transRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (transRows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const transaction = transRows[0];
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      await connection.query('DELETE FROM transactions WHERE id = ?', [transactionId]);
      
      if (transaction.type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id]);
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
app.get('/api/budgets', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as category_name 
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
    `);
    
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

app.post('/api/budgets', async (req, res) => {
  try {
    const { id, category, amount, spent, period, startDate, endDate } = req.body;
    await pool.query(
      'INSERT INTO budgets (id, category_id, amount, spent, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, category, amount, spent, period, startDate, endDate]
    );
    res.status(201).json({ message: 'Budget created successfully' });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Gam3eyas endpoints
app.get('/api/gam3eyas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gam3eyas');
    
    const transformedRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      totalAmount: parseFloat(row.total_amount),
      contributionAmount: parseFloat(row.contribution_amount),
      members: row.members,
      startDate: row.start_date.toISOString().split('T')[0],
      endDate: row.end_date.toISOString().split('T')[0],
      currentCycle: row.current_cycle,
      totalCycles: row.total_cycles,
      isAdmin: !!row.is_admin,
      nextPaymentDate: row.next_payment_date.toISOString().split('T')[0]
    }));
    
    res.json(transformedRows);
  } catch (error) {
    console.error('Error fetching gam3eyas:', error);
    res.status(500).json({ error: 'Failed to fetch gam3eyas' });
  }
});

app.post('/api/gam3eyas', async (req, res) => {
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
      nextPaymentDate 
    } = req.body;
    
    await pool.query(
      'INSERT INTO gam3eyas (id, name, total_amount, contribution_amount, members, start_date, end_date, current_cycle, total_cycles, is_admin, next_payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate]
    );
    
    res.status(201).json({ message: 'Gam3eya created successfully' });
  } catch (error) {
    console.error('Error creating gam3eya:', error);
    res.status(500).json({ error: 'Failed to create gam3eya' });
  }
});

app.put('/api/gam3eyas/:id', async (req, res) => {
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
      nextPaymentDate 
    } = req.body;
    
    await pool.query(
      'UPDATE gam3eyas SET name = ?, total_amount = ?, contribution_amount = ?, members = ?, start_date = ?, end_date = ?, current_cycle = ?, total_cycles = ?, is_admin = ?, next_payment_date = ? WHERE id = ?',
      [name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate, req.params.id]
    );
    
    res.json({ message: 'Gam3eya updated successfully' });
  } catch (error) {
    console.error('Error updating gam3eya:', error);
    res.status(500).json({ error: 'Failed to update gam3eya' });
  }
});

app.delete('/api/gam3eyas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gam3eyas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gam3eya deleted successfully' });
  } catch (error) {
    console.error('Error deleting gam3eya:', error);
    res.status(500).json({ error: 'Failed to delete gam3eya' });
  }
});

// Financial summary endpoint
app.get('/api/financial-summary', async (req, res) => {
  try {
    const [wallets] = await pool.query('SELECT * FROM wallets');
    const totalBalance = wallets.reduce((acc, wallet) => acc + parseFloat(wallet.balance), 0);
    
    const [income] = await pool.query('SELECT SUM(amount) as totalIncome FROM transactions WHERE type = "income"');
    const [expenses] = await pool.query('SELECT SUM(amount) as totalExpenses FROM transactions WHERE type = "expense"');
    
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
