const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
// const env = require('dotenv')
const app = express();

// Database connection
const db = require('./config/database');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const propertyOwnerRoutes = require('./routes/propertyOwner');
const tradesmanRoutes = require('./routes/tradesman');
const { env } = require('process');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/property-owner', propertyOwnerRoutes);
app.use('/tradesman', tradesmanRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 