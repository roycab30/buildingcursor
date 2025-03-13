const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const TradesmanProfile = require('../models/TradesmanProfile');
const PropertyOwnerProfile = require('../models/PropertyOwnerProfile');

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.user_id;
        req.session.userType = user.user_type;

        // Redirect based on user type
        switch (user.user_type) {
            case 'admin':
                res.redirect('/admin/dashboard');
                break;
            case 'property_owner':
                res.redirect('/property-owner/dashboard');
                break;
            case 'tradesperson':
                res.redirect('/tradesman/dashboard');
                break;
            default:
                res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred during login' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

// GET registration page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword, firstName, lastName, userType } = req.body;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            return res.render('register', { error: 'Passwords do not match' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email already registered' });
        }
        
        // Create new user
        await User.create({
            email,
            password,
            firstName,
            lastName,
            userType
        });
        
        // Redirect to login page with success message
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred during registration' });
    }
});

module.exports = router; 