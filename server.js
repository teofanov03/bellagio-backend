// server.js

// ---------------------------------------------------
// 1. Uvoz Modula i Konfiguracija
// ---------------------------------------------------
require('dotenv').config(); 

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

// ---------------------------------------------------
// 2. Uvoz Ruta
// ---------------------------------------------------
const dishRoutes = require('./routes/dishes');
const reservationRoutes = require('./routes/reservations');
const authRoutes = require('./routes/auth');


// ---------------------------------------------------
// 3. Middleware i Sigurnost
// ---------------------------------------------------

// Određivanje dozvoljenog porekla
// U produkciji (Render) koristi se CLIENT_URL (koji će biti vaš Vercel domen).
// U razvoju koristi localhost.
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173'; 

// Security HTTP headers (Helmet)
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: allowedOrigin, // Dinamičko postavljanje Vercel ili Localhost domena
    credentials: true, 
}));

// Cookie Parser (Potrebno za čitanje HTTP-only kolačića)
app.use(cookieParser());

// Podesite Cross-Origin-Resource-Policy za statičke resurse
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON bodies (Omogućava čitanje req.body)
app.use(express.json());

// Rate limiting: 100 requests per IP per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use(limiter);


// ---------------------------------------------------
// 4. Montiranje Ruta
// ---------------------------------------------------

// Glavna ruta
app.get('/', (req, res) => {
    res.json({ message: 'Ristorante Bellagio Backend is running' });
});

// Montiranje specifičnih API ruta
app.use('/api/dishes', dishRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/v1/auth', authRoutes);


// ---------------------------------------------------
// 5. Pokretanje Servera i Konektovanje na Bazu
// ---------------------------------------------------

const PORT = process.env.PORT || 5000;

// Konektovanje na MongoDB i pokretanje servera
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`CORS allowed origin: ${allowedOrigin}`); // Dodato za lakšu proveru
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message || err);
        process.exit(1);
    });