const express = require('express');
const router = express.Router();
const conn = require('../config/database');
const { isAdmin, isAuthenticated } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Protect all admin routes
router.use(isAuthenticated, isAdmin);

// Admin dashboard
router.get('/dashboard', async (req, res) => {
    try {
        console.log('Admin dashboard accessed');
        // Get all users and statistics
        const [users] = await conn.execute('SELECT * FROM users');
        
        // Get system statistics
        const [stats] = await conn.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE user_type = 'tradesperson') as tradesperson_count,
                (SELECT COUNT(*) FROM users WHERE user_type = 'property_owner') as property_owner_count,
                (SELECT COUNT(*) FROM projects) as total_projects,
                (SELECT COUNT(*) FROM projects WHERE status = 'open') as open_projects
        `);
        
        res.render('admin/dashboard', {
            users: users,
            stats: stats[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get all users
router.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users WHERE user_id != ?';
    conn.query(sql, [req.session.userId], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(users);
    });
});

// Get user details
router.get('/users/:id', (req, res) => {
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    conn.query(sql, [req.params.id], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (user.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(user[0]);
    });
});

// Update user status (POST method)
router.post('/users/:id/status', (req, res) => {
    const sql = 'UPDATE users SET status = ? WHERE user_id = ?';
    conn.query(sql, [req.body.status, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.redirect('/admin/dashboard?error=Failed to update status');
        }
        res.redirect('/admin/dashboard?message=Status updated successfully');
    });
});

// Delete user (POST method)
router.post('/users/:id/delete', (req, res) => {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    conn.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.redirect('/admin/dashboard?error=Failed to delete user');
        }
        res.redirect('/admin/dashboard?message=User deleted successfully');
    });
});

// Add user (POST method)
router.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const sql = `INSERT INTO users (
            email, password, first_name, last_name, user_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;

        conn.query(sql, [
            req.body.email,
            hashedPassword,
            req.body.first_name,
            req.body.last_name,
            req.body.user_type
        ], (err, result) => {
            if (err) {
                console.error('Error adding user:', err);
                return res.redirect('/admin/dashboard?error=Failed to add user');
            }
            console.log('User added successfully');
            res.redirect('/admin/dashboard?message=User added successfully');
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/dashboard?error=Failed to create user');
    }
});

// Get commission reports
router.get('/commissions', async (req, res) => {
    try {
        const [commissions] = await conn.execute(`
            SELECT 
                t.transaction_id,
                t.amount,
                t.created_at,
                p.title as project_title,
                u.first_name as tradesman_first_name,
                u.last_name as tradesman_last_name
            FROM transactions t
            JOIN projects p ON t.project_id = p.project_id
            JOIN users u ON t.payer_id = u.user_id
            WHERE t.transaction_type = 'fee'
            ORDER BY t.created_at DESC
        `);
        
        res.json(commissions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Calculate and charge commission
router.post('/charge-commission', async (req, res) => {
    try {
        const { project_id, amount } = req.body;
        const commission = amount * 0.05; // 5% commission

        // Create commission transaction
        await conn.execute(`
            INSERT INTO transactions 
            (project_id, payer_id, payee_id, amount, transaction_type, status)
            SELECT 
                ?, 
                b.tradesperson_id,
                (SELECT user_id FROM users WHERE user_type = 'admin' LIMIT 1),
                ?,
                'fee',
                'completed'
            FROM bids b
            WHERE b.project_id = ? AND b.status = 'accepted'
        `, [project_id, commission, project_id]);

        res.json({ message: 'Commission charged successfully', amount: commission });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Admin registration handler
router.post('/register', async (req, res) => {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Begin transaction
        const connection = await conn.getConnection();
        await connection.beginTransaction();

        try {
            // Insert new admin user - simplified without admin_profiles
            const [result] = await connection.execute(
                `INSERT INTO users (
                    first_name, 
                    last_name, 
                    email, 
                    phone_number, 
                    user_type, 
                    password, 
                    address, 
                    postcode, 
                    created_at, 
                    updated_at,
                    profile_completed
                ) VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, NOW(), NOW(), true)`,
                [
                    req.body.first_name,
                    req.body.last_name,
                    req.body.email,
                    req.body.phone_number,
                    hashedPassword,
                    req.body.address,
                    req.body.postcode.toUpperCase()
                ]
            );

            // Get the auto-generated user_id
            const userId = result.insertId;

            // Create user settings
            await connection.execute(
                `INSERT INTO user_settings (
                    user_id, 
                    notification_preferences,
                    created_at, 
                    updated_at
                ) VALUES (?, 'email', NOW(), NOW())`,
                [userId]
            );

            // Commit transaction
            await connection.commit();

            // Set up session
            req.session.userId = userId;
            req.session.userType = 'admin';

            // Redirect to admin dashboard
            res.redirect('/admin/dashboard');

        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Admin registration error:', error);
        res.render('admin/register', {
            errors: ['An error occurred during registration. Please try again.'],
            formData: req.body
        });
    }
});

module.exports = router; 