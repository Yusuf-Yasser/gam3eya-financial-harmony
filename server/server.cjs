const express = require('express');
const cors = require('cors');
const pool = require('./db.cjs');

const app = express();
const PORT = 3001;

// Date utils for consistent date formatting
const dateUtils = {
  formatDate: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  } catch (error) {
    console.error('Error checking or updating database schema:', error);
  }
})();

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
    const { id, name, icon, type, color, isCustom } = req.body;
    await pool.query(
      'INSERT INTO categories (id, name, icon, type, color, is_custom) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, icon, type, color, isCustom ? 1 : 0]
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
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the transaction
      await connection.query(
        'INSERT INTO transactions (id, amount, type, category_id, description, date, wallet_id, receipt_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, amount, type, category, description, date, walletId, receiptUrl]
      );
      
      // Update the wallet balance
      if (type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, walletId]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, walletId]);
      }
      
      // If it's an expense, update the related budget's spent amount
      if (type === 'expense') {
        // Check if there's a budget for this category
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ?', [category]);
        if (budgetRows.length > 0) {
          // Update the budget's spent amount
          await connection.query(
            'UPDATE budgets SET spent = spent + ? WHERE category_id = ?', 
            [amount, category]
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
      
      // Update wallet balance
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
      
      // Update budgets
      // If the old transaction was an expense, reduce the budget spent
      if (oldTransaction.type === 'expense') {
        const [oldBudgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ?', [oldTransaction.category_id]);
        if (oldBudgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent - ? WHERE category_id = ?', 
            [parseFloat(oldTransaction.amount), oldTransaction.category_id]
          );
        }
      }
      
      // If the new transaction is an expense, increase the budget spent
      if (type === 'expense') {
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ?', [category]);
        if (budgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent + ? WHERE category_id = ?', 
            [amount, category]
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
      
      // Update wallet balance
      if (transaction.type === 'income') {
        await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id]);
      } else {
        await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', 
          [parseFloat(transaction.amount), transaction.wallet_id]);
      }
      
      // If it was an expense, update the related budget
      if (transaction.type === 'expense') {
        const [budgetRows] = await connection.query('SELECT * FROM budgets WHERE category_id = ?', [transaction.category_id]);
        if (budgetRows.length > 0) {
          await connection.query(
            'UPDATE budgets SET spent = spent - ? WHERE category_id = ?', 
            [parseFloat(transaction.amount), transaction.category_id]
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
    
    // First check if a budget already exists for this category
    const [existingBudgets] = await pool.query('SELECT * FROM budgets WHERE category_id = ?', [category]);
    if (existingBudgets.length > 0) {
      return res.status(400).json({ error: 'A budget for this category already exists' });
    }
    
    // Calculate initial spent amount from existing transactions
    let initialSpent = spent || 0;
    if (!spent) {
      const [transactionRows] = await pool.query(
        'SELECT SUM(amount) as total FROM transactions WHERE category_id = ? AND type = "expense"', 
        [category]
      );
      if (transactionRows[0].total) {
        initialSpent = parseFloat(transactionRows[0].total);
      }
    }
    
    await pool.query(
      'INSERT INTO budgets (id, category_id, amount, spent, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, category, amount, initialSpent, period, startDate, endDate]
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
app.get('/api/gam3eyas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gam3eyas');
    
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
      nextPaymentDate,
      myTurn,
      paidCycles,
      receivedPayout
    } = req.body;
    
    await pool.query(
      'INSERT INTO gam3eyas (id, name, total_amount, contribution_amount, members, start_date, end_date, current_cycle, total_cycles, is_admin, next_payment_date, my_turn, paid_cycles, received_payout) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate, myTurn, paidCycles ? JSON.stringify(paidCycles) : '[]', receivedPayout || false]
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
      nextPaymentDate,
      myTurn,
      paidCycles,
      receivedPayout
    } = req.body;
    
    await pool.query(
      'UPDATE gam3eyas SET name = ?, total_amount = ?, contribution_amount = ?, members = ?, start_date = ?, end_date = ?, current_cycle = ?, total_cycles = ?, is_admin = ?, next_payment_date = ?, my_turn = ?, paid_cycles = ?, received_payout = ? WHERE id = ?',
      [name, totalAmount, contributionAmount, members, startDate, endDate, currentCycle, totalCycles, isAdmin, nextPaymentDate, myTurn, paidCycles ? JSON.stringify(paidCycles) : '[]', receivedPayout || false, req.params.id]
    );
    
    res.json({ message: 'Gam3eya updated successfully' });
  } catch (error) {
    console.error('Error updating gam3eya:', error);
    res.status(500).json({ error: 'Failed to update gam3eya' });
  }
});

app.delete('/api/gam3eyas/:id', async (req, res) => {
  try {
    // First, delete any payments related to this gam3eya
    await pool.query('DELETE FROM gam3eya_payments WHERE gam3eya_id = ?', [req.params.id]);
    
    // Then delete the gam3eya
    await pool.query('DELETE FROM gam3eyas WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Gam3eya deleted successfully' });
  } catch (error) {
    console.error('Error deleting gam3eya:', error);
    res.status(500).json({ error: 'Failed to delete gam3eya' });
  }
});

// Gam3eya Payments endpoints
app.post('/api/gam3eya-payments', async (req, res) => {
  try {
    const { id, gam3eyaId, walletId, amount, date, cycle, type } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the payment
      await connection.query(
        'INSERT INTO gam3eya_payments (id, gam3eya_id, wallet_id, amount, date, cycle, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, gam3eyaId, walletId, amount, date, cycle, type]
      );
      
      // We're removing the wallet balance update from here because it's handled by the transaction creation
      // in the frontend (src/pages/Gam3eya.tsx)
      
      // Update gam3eya's paid cycles and other state
      if (type === 'payment') {
        // Update gam3eya's paid cycles
        const [gam3eyaRows] = await connection.query('SELECT * FROM gam3eyas WHERE id = ?', [gam3eyaId]);
        if (gam3eyaRows.length > 0) {
          const gam3eya = gam3eyaRows[0];
          const paidCycles = gam3eya.paid_cycles ? JSON.parse(gam3eya.paid_cycles) : [];
          
          if (!paidCycles.includes(cycle)) {
            paidCycles.push(cycle);
            
            // Update the gam3eya record with paid cycles and increment current cycle
            await connection.query(
              'UPDATE gam3eyas SET paid_cycles = ?, current_cycle = ? WHERE id = ?',
              [JSON.stringify(paidCycles), Math.max(gam3eya.current_cycle, cycle), gam3eyaId]
            );
          }
        }
      } else if (type === 'payout') {
        // Mark as received in gam3eya
        await connection.query('UPDATE gam3eyas SET received_payout = ? WHERE id = ?', [true, gam3eyaId]);
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

app.get('/api/gam3eya-payments/:gam3eyaId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM gam3eya_payments WHERE gam3eya_id = ? ORDER BY date ASC',
      [req.params.gam3eyaId]
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
