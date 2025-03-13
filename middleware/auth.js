const auth = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.userId) {
            return next();
        }
        res.redirect('/auth/login');
    },

    isAdmin: (req, res, next) => {
        if (req.session && req.session.userType === 'admin') {
            return next();
        }
        res.status(403).send('Access denied');
    },

    isPropertyOwner: (req, res, next) => {
        if (req.session && req.session.userType === 'property_owner') {
            return next();
        }
        res.status(403).send('Access denied');
    },

    isTradesman: (req, res, next) => {
        if (req.session && req.session.userType === 'tradesperson') {
            return next();
        }
        res.status(403).send('Access denied');
    }
};

module.exports = auth; 