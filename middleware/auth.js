const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware za zaštitu ruta (Proverava Token)
exports.protect = async (req, res, next) => {
    let token;

    // Provera da li je token poslat u cookie-ju ili u Authorization zaglavlju
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Postavi token iz zaglavlja (Header: 'Bearer TOKEN')
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Postavi token iz HTTP-only cookie-ja (Sigurnija opcija)
        token = req.cookies.token;
    }

    // Provera da li token postoji
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route. (Token missing)' });
    }

    try {
        // Verifikacija tokena
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Pronalaženje korisnika po ID-u iz tokena i njegovo dodavanje u req objekat
        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route. (Invalid token)' });
    }
};

// Middleware za proveru uloge (Autorizacija)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `User role ${req.user.role} is not authorized to access this route.` 
            });
        }
        next();
    };
};