const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, isPropertyOwner } = require('../middleware/auth');

// Protect all property owner routes
router.use(isAuthenticated, isPropertyOwner);

// Property Owner dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Fetch owner's projects
        const [projects] = await db.execute(`
            SELECT 
                p.*,
                COUNT(DISTINCT b.bid_id) as bid_count
            FROM projects p
            LEFT JOIN bids b ON p.project_id = b.project_id
            WHERE p.owner_id = ?
            GROUP BY p.project_id
            ORDER BY p.created_at DESC
        `, [req.session.userId]);

        // Fetch active projects with accepted bids
        const [activeProjects] = await db.execute(`
            SELECT 
                p.*,
                b.tradesperson_id,
                u.first_name,
                u.last_name,
                u.phone
            FROM projects p
            JOIN bids b ON p.project_id = b.project_id
            JOIN tradesperson_profiles tp ON b.tradesperson_id = tp.profile_id
            JOIN users u ON tp.user_id = u.user_id
            WHERE p.owner_id = ? AND b.status = 'accepted'
        `, [req.session.userId]);
        // Fetch trade categories
        const [categories] = await db.execute(`
            SELECT *
            FROM trade_categories
            ORDER BY name ASC
        `, [req.session.userId]);

        res.render('property-owner/dashboard', {
            projects,
            activeProjects,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create new project
router.post('/projects', async (req, res) => {
    try {
        const {
            title,
            description,
            category_id,
            budget_min,
            budget_max,
            location,
            required_completion_date
        } = req.body;

        
        const [result] = await db.execute(`
            INSERT INTO projects 
            (owner_id, category_id, title, description, budget_min, budget_max, location, required_completion_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
        `, [req.session.userId, category_id, title, description, budget_min, budget_max, location, required_completion_date]);

        res.json({ 
            message: 'Project created successfully',
            project_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get project bids
router.get('/projects/:id/bids', async (req, res) => {
    try {
        const [bids] = await db.execute(`
            SELECT 
                b.*,
                u.first_name,
                u.last_name,
                tp.business_name,
                tp.years_experience
            FROM bids b
            JOIN tradesperson_profiles tp ON b.tradesperson_id = tp.profile_id
            JOIN users u ON tp.user_id = u.user_id
            WHERE b.project_id = ?
        `, [req.params.id]);

        res.json(bids);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Accept bid
router.put('/projects/:projectId/bids/:bidId/accept', async (req, res) => {
    try {
        await db.execute('START TRANSACTION');

        // Update bid status to accepted
        await db.execute(
            'UPDATE bids SET status = "accepted" WHERE bid_id = ? AND project_id = ?',
            [req.params.bidId, req.params.projectId]
        );

        // Update project status to in_progress
        await db.execute(
            'UPDATE projects SET status = "in_progress" WHERE project_id = ?',
            [req.params.projectId]
        );

        // Reject all other bids
        await db.execute(
            'UPDATE bids SET status = "rejected" WHERE project_id = ? AND bid_id != ?',
            [req.params.projectId, req.params.bidId]
        );

        await db.execute('COMMIT');
        res.json({ message: 'Bid accepted successfully' });
    } catch (error) {
        await db.execute('ROLLBACK');
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Mark project as completed
router.put('/projects/:id/complete', async (req, res) => {
    try {
        await db.execute('START TRANSACTION');

        // Update project status
        await db.execute(
            'UPDATE projects SET status = "completed" WHERE project_id = ? AND owner_id = ?',
            [req.params.id, req.session.userId]
        );

        // Get project and bid details for commission calculation
        const [projectDetails] = await db.execute(`
            SELECT b.amount
            FROM projects p
            JOIN bids b ON p.project_id = b.project_id
            WHERE p.project_id = ? AND b.status = 'accepted'
        `, [req.params.id]);

        if (projectDetails.length > 0) {
            const commission = projectDetails[0].amount * 0.05; // 5% commission
            // Commission transaction will be handled by admin
        }

        await db.execute('COMMIT');
        res.json({ message: 'Project marked as completed' });
    } catch (error) {
        await db.execute('ROLLBACK');
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router; 