const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, isTradesman } = require('../middleware/auth');
const path = require('path');

// Protect all tradesman routes
router.use(isAuthenticated, isTradesman);

// Tradesman dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Get user information
        const [users] = await db.execute(
            'SELECT user_id, first_name, last_name, user_type FROM users WHERE user_id = ?',
            [req.session.userId]
        );

        // Get tradesman profile
        const [profile] = await db.execute(
            'SELECT * FROM tradesperson_profiles WHERE user_id = ?',
            [req.session.userId]
        );

        if (profile.length === 0) {
            // If no profile, render the create profile page
            return res.render('tradesman/profile', {
                message: 'You have not created a tradesperson profile yet. Please create one to access the dashboard.',
                user: users[0]
            });
        }

        // Fetch available projects matching tradesman's categories
        const [availableProjects] = await db.execute(`
            SELECT 
                p.*,
                u.first_name as owner_first_name,
                u.last_name as owner_last_name,
                tc.name as category_name
            FROM projects p
            JOIN users u ON p.owner_id = u.user_id
            JOIN trade_categories tc ON p.category_id = tc.category_id
            JOIN tradesperson_categories tpc ON tc.category_id = tpc.category_id
            WHERE tpc.tradesperson_id = ? 
            AND p.status = 'open'
            ORDER BY p.created_at DESC
        `, [profile[0].profile_id]);

        // Fetch tradesman's active projects (accepted bids)
        const [activeProjects] = await db.execute(`
            SELECT 
                p.*,
                b.amount as bid_amount,
                b.status as bid_status,
                u.first_name as owner_first_name,
                u.last_name as owner_last_name
            FROM projects p
            JOIN bids b ON p.project_id = b.project_id
            JOIN users u ON p.owner_id = u.user_id
            WHERE b.tradesperson_id = ? 
            AND b.status = 'accepted'
            AND p.status = 'in_progress'
        `, [profile[0].profile_id]);

        res.render('tradesman/dashboard', {
            user: users[0], // Pass user information to the view
            profile: profile[0],
            availableProjects,
            activeProjects
        });
    } catch (error) {
        console.error('Error in tradesman dashboard:', error);
        res.status(500).send('Server error');
    }
});

// Submit bid for project
router.post('/projects/:id/bid', async (req, res) => {
    try {
        const { amount, description, estimated_completion_date } = req.body;
        const project_id = req.params.id;

        // Get tradesman's profile_id
        const [profile] = await db.execute(
            'SELECT profile_id FROM tradesperson_profiles WHERE user_id = ?',
            [req.session.userId]
        );

        // Check if already bid on this project
        const [existingBid] = await db.execute(
            'SELECT * FROM bids WHERE project_id = ? AND tradesperson_id = ?',
            [project_id, profile[0].profile_id]
        );

        if (existingBid.length > 0) {
            return res.status(400).send('You have already bid on this project');
        }

        // Create new bid
        await db.execute(`
            INSERT INTO bids 
            (project_id, tradesperson_id, amount, description, estimated_completion_date)
            VALUES (?, ?, ?, ?, ?)
        `, [project_id, profile[0].profile_id, amount, description, estimated_completion_date]);

        res.json({ message: 'Bid submitted successfully' });
    } catch (error) {
        console.error('Error in tradesman dashboard:', {
            error: error.message,
            userId: req.session.userId,
            profileData: profile
        });
        res.status(500).send('Server error 2');
    }
});

// Update bid
router.put('/bids/:id', async (req, res) => {
    try {
        const { amount, description, estimated_completion_date } = req.body;
        
        // Get tradesman's profile_id
        const [profile] = await db.execute(
            'SELECT profile_id FROM tradesperson_profiles WHERE user_id = ?',
            [req.session.userId]
        );

        // Update bid
        await db.execute(`
            UPDATE bids 
            SET amount = ?, description = ?, estimated_completion_date = ?
            WHERE bid_id = ? AND tradesperson_id = ? AND status = 'pending'
        `, [amount, description, estimated_completion_date, req.params.id, profile[0].profile_id]);

        res.json({ message: 'Bid updated successfully' });
    } catch (error) {
        console.error('Error in tradesman dashboard:', {
            error: error.message,
            userId: req.session.userId,
            profileData: profile
        });
        res.status(500).send('Server error 3');
    }
});

// Withdraw bid
router.put('/bids/:id/withdraw', async (req, res) => {
    try {
        // Get tradesman's profile_id
        const [profile] = await db.execute(
            'SELECT profile_id FROM tradesperson_profiles WHERE user_id = ?',
            [req.session.userId]
        );

        // Update bid status to withdrawn
        await db.execute(
            'UPDATE bids SET status = "withdrawn" WHERE bid_id = ? AND tradesperson_id = ? AND status = "pending"',
            [req.params.id, profile[0].profile_id]
        );

        res.json({ message: 'Bid withdrawn successfully' });
    } catch (error) {
        console.error('Error in tradesman dashboard:', {
            error: error.message,
            userId: req.session.userId,
            profileData: profile
        });
        res.status(500).send('Server error 4');
    }
});

// Update availability status
router.put('/availability', async (req, res) => {
    try {
        const { availability_status } = req.body;
        const validStatuses = ['available', 'busy', 'unavailable'];

        if (!validStatuses.includes(availability_status)) {
            return res.status(400).send('Invalid status');
        }

        await db.execute(
            'UPDATE tradesperson_profiles SET availability_status = ? WHERE user_id = ?',
            [availability_status, req.session.userId]
        );

        res.json({ message: 'Availability status updated successfully' });
    } catch (error) {
        console.error('Error in tradesman dashboard:', {
            error: error.message,
            userId: req.session.userId,
            profileData: profile
        });
        res.status(500).send('Server error 5');
    }
});

// Function to validate profile data
const validateProfileData = (data) => {
    const errors = [];
    
    // Validate trade type
    if (!data.trade_type || data.trade_type.trim() === '') {
        errors.push('Trade type is required');
    }

    // Validate experience years
    const years = parseInt(data.experience_years);
    if (isNaN(years) || years < 0 || years > 100) {
        errors.push('Experience years must be between 0 and 100');
    }

    // Validate hourly rate
    const rate = parseFloat(data.hourly_rate);
    if (isNaN(rate) || rate <= 0) {
        errors.push('Hourly rate must be greater than 0');
    }

    // Validate qualification
    if (!data.qualification || data.qualification.trim() === '') {
        errors.push('Qualification is required');
    }

    // Validate description
    if (!data.description || data.description.trim() === '') {
        errors.push('Description is required');
    }

    // Validate service area
    const area = parseInt(data.service_area);
    if (isNaN(area) || area <= 0 || area > 100) {
        errors.push('Service area must be between 1 and 100 miles');
    }

    // Validate insurance info
    if (!data.insurance_info || data.insurance_info.trim() === '') {
        errors.push('Insurance information is required');
    }

    return errors;
};

// Function to create tradesperson profile
const createTradesmanProfile = async (userId, profileData) => {
    try {
        // Check if profile already exists
        const [existingProfile] = await db.execute(
            'SELECT profile_id FROM tradesperson_profiles WHERE user_id = ?',
            [userId]
        );

        if (existingProfile.length > 0) {
            throw new Error('Profile already exists for this user');
        }

        // Insert the profile
        const [result] = await db.execute(
            `INSERT INTO tradesperson_profiles 
            (user_id, trade_type, experience_years, hourly_rate, qualification, 
             description, service_area, insurance_info, availability_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW(), NOW())`,
            [
                userId,
                profileData.trade_type,
                parseInt(profileData.experience_years),
                parseFloat(profileData.hourly_rate),
                profileData.qualification,
                profileData.description,
                parseInt(profileData.service_area),
                profileData.insurance_info
            ]
        );

        // Update user's profile completion status
        await db.execute(
            'UPDATE users SET profile_completed = true WHERE user_id = ?',
            [userId]
        );

        return result.insertId;
    } catch (error) {
        throw error;
    }
};

// POST endpoint for creating tradesperson profile
router.post('/profile', async (req, res) => {
    try {
        // Get the user ID from the session
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).render('tradesman/profile', {
                error: 'Please login to create a profile',
                formData: req.body
            });
        }

        // Validate the input data
        const validationErrors = validateProfileData(req.body);
        if (validationErrors.length > 0) {
            return res.render('tradesman/profile', {
                errors: validationErrors,
                formData: req.body
            });
        }

        // Create the profile
        await createTradesmanProfile(userId, req.body);

        // Redirect to dashboard on success
        res.redirect('/tradesman/dashboard');

    } catch (error) {
        console.error('Error creating tradesperson profile:', error);
        
        // Handle specific errors
        if (error.message === 'Profile already exists for this user') {
            return res.render('tradesman/profile', {
                error: 'You already have a profile. Please update your existing profile instead.',
                formData: req.body
            });
        }

        // Handle general errors
        res.render('tradesman/profile', {
            error: 'Failed to create profile. Please try again.',
            formData: req.body
        });
    }
});

module.exports = router; 