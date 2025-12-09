const User = require('../models/User');

// @desc    Register user (Create Admin User)
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Kreira korisnika. Mongoose pre-save middleware automatski hešuje lozinku!
        const user = await User.create({ name, email, password, role: 'admin' });

        // Generiše token i šalje ga kao odgovor
        sendTokenResponse(user, 201, res);

    } catch (error) {
        // Rukovanje greškama validacije i duplikatima
        res.status(400).json({ success: false, error: error.message || 'Error during registration.' });
    }
};

// @desc    Login user (Admin)
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // Provera da li su uneti email i lozinka
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Provera korisnika u bazi
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Provera lozinke korišćenjem metode iz User modela
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
};

// Pomoćna funkcija za slanje tokena u cookie-ju
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

   const options = {
        // expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), <-- OBRISANO
        httpOnly: true,
        // Dodajemo SameSite opciju za bolju sigurnost
        sameSite: 'Lax', 
    };

    // Ako je produkcija, koristi HTTPS
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options) // Token je Session Cookie
        .json({
            success: true,
            // --------------------------------------------------
            // UKLONJENO: Ne šaljemo token u telu odgovora
            // token 
            // --------------------------------------------------
        });
};