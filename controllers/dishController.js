const Dish = require('../models/Dish');

// @desc    GET all dishes (Public access)
// @route   GET /api/dishes
exports.getDishes = async (req, res) => {
    try {
        const dishes = await Dish.find().sort({ category: 1, name: 1 });
        // Status 200: OK
        res.status(200).json({ success: true, count: dishes.length, data: dishes });
    } catch (error) {
        // Status 500: Internal Server Error
        res.status(500).json({ success: false, error: 'Server Error: Cannot retrieve dishes.' });
    }
};

// @desc    GET single dish by ID (Public access)
// @route   GET /api/dishes/:id
exports.getDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            // Status 404: Not Found
            return res.status(404).json({ success: false, error: 'Dish not found.' });
        }
        
        // Status 200: OK
        res.status(200).json({ success: true, data: dish });

    } catch (error) {
        // Status 500: Internal Server Error (or 400 for bad ID format)
        res.status(500).json({ success: false, error: 'Server Error or Invalid Dish ID format.' });
    }
};
// ... (ostali kod i getDishes/getDish funkcije)

exports.createDish = async (req, res) => {
    try {
        // --- NOVI KOD ZA RUKOVANJE SLIKOM ---
        // Proveravamo da li je Multer middleware sačuvao fajl.
        if (req.file) {
            // Kreiranje javne putanje do fajla (npr. /uploads/167823...jpg)
            const imageUrl = `/uploads/${req.file.filename}`;
            // Dodajemo putanju u telo zahteva pre kreiranja u bazi
            req.body.imageUrl = imageUrl; 
        }
        // -------------------------------------

        const dish = await Dish.create(req.body);
        
        // Status 201: Created
        res.status(201).json({ 
            success: true, 
            data: dish, 
            message: 'Dish created successfully.' 
        });

    } catch (error) {
        // Rukovanje greškama validacije (npr. ime je obavezno, cena mora biti > 0)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                error: messages.join(', ') 
            });
        }
        // Rukovanje greškom duplikata (npr. ime jela je unique)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                error: 'Dish name already exists.' 
            });
        }

        res.status(500).json({ success: false, error: 'Server Error during dish creation.' });
    }
};
// @desc    Update dish (Admin access)
// @route   PUT /api/dishes/:id
// @desc    Update dish (Admin access)
// @route   PUT /api/dishes/:id
exports.updateDish = async (req, res) => {
    try {
        // --- NOVI KOD ZA RUKOVANJE SLIKOM TOKOM AŽURIRANJA ---
        // Proveravamo da li je Multer middleware sačuvao NOVI fajl.
        if (req.file) {
            // Kreiramo novu putanju
            const imageUrl = `/uploads/${req.file.filename}`;
            // Dodajemo putanju u telo zahteva (ovo će prebrisati staru putanju u bazi)
            req.body.imageUrl = imageUrl; 
        }
        // --------------------------------------------------------

        const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Vraća ažurirani dokument
            runValidators: true // Važno: ponovo pokreće Mongoose validatore
        });

        if (!dish) {
            return res.status(404).json({ success: false, error: 'Dish not found for update.' });
        }

        res.status(200).json({ success: true, data: dish, message: 'Dish updated successfully.' });

    } catch (error) {
        // Rukovanje greškama validacije tokom ažuriranja
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                error: messages.join(', ') 
            });
        }
        res.status(500).json({ success: false, error: 'Server Error during dish update.' });
    }
};
// @desc    Delete dish (Admin access)
// @route   DELETE /api/dishes/:id
exports.deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findByIdAndDelete(req.params.id);

        if (!dish) {
            return res.status(404).json({ success: false, error: 'Dish not found for deletion.' });
        }
        
        // Status 200: OK (sa praznim telom jer je resurs obrisan)
        res.status(200).json({ success: true, data: {}, message: 'Dish deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error during dish deletion.' });
    }
};