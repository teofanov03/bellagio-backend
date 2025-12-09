// server.js

// ---------------------------------------------------
// 1. Uvoz Modula i Konfiguracija
// ---------------------------------------------------
require('dotenv').config(); // Učitavanje .env varijabli

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // Dodajemo za rukovanje JWT HTTP-only kolačićima

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

// Security HTTP headers (Helmet)
app.use(helmet());

// Enable CORS - Podesite opcije ako je potrebno (npr. samo za određeni domen)
app.use(cors({
    origin: 'http://localhost:5173', // Primer: Dozvoli samo Frontend na portu 3000
    credentials: true, // Važno: Dozvoljava slanje HTTP-only kolačića
}));

// Cookie Parser (Potrebno za čitanje HTTP-only kolačića)
app.use(cookieParser());
app.use((req, res, next) => {
    // Ovo rešava ERR_BLOCKED_BY_RESPONSE.NotSameOrigin u nekim browserima.
    // Postavlja Cross-Origin-Resource-Policy na 'cross-origin' za sve resurse,
    // što je sigurno jer se vaš Backend koristi kao API i server statičkih resursa.
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
app.use('/api/v1/auth', authRoutes); // Koristimo v1 za Auth


// ---------------------------------------------------
// 5. Pokretanje Servera i Konektovanje na Bazu
// ---------------------------------------------------

const PORT = process.env.PORT || 5000;

// Konektovanje na MongoDB i pokretanje servera
// NAPOMENA: Uklanjamo zastarele opcije (useNewUrlParser, useUnifiedTopology, itd.)
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message || err);
        // Prekini proces sa greškom
        process.exit(1);
    });