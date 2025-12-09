const multer = require('multer');
const path = require('path');

// Definicija skladišta (Storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Postavite putanju gde će slike biti sačuvane (npr. u public/uploads folder)
        cb(null, path.join(__dirname, '../public/uploads')); 
    },
    filename: function (req, file, cb) {
        // Kreiranje jedinstvenog imena fajla da bi se izbegli konflikti
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter za fajlove (Prihvata samo slike)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false); // Odbija fajl ako nije slika
    }
};

// Inicijalizacija Multer-a
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Ograničenje veličine fajla na 5MB
});

// Izvozimo funkciju za pojedinačan fajl (koju ćemo koristiti u ruti)
exports.uploadSingleImage = (fieldName) => upload.single(fieldName);