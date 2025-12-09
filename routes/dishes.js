const express = require('express');
const router = express.Router();


const { 
    getDishes, getDish, 
    createDish, updateDish, deleteDish // NOVE FUNKCIJE 
} = require('../controllers/dishController');
const { protect, authorize } = require('../middleware/auth'); // UVEZENO

// Javne rute
const { uploadSingleImage } = require('../middleware/uploadMiddleware'); // Prilagodite putanju!

// Javne rute
router.route('/')
     .get(getDishes)
    // NOVO: Ubacite upload middleware pre createDish kontrolera
    // Očekuje se fajl sa imenom polja 'dishImage' iz forme
     .post(protect, authorize('admin'), uploadSingleImage('dishImage'), createDish); 

router.route('/:id')
    .get(getDish)
    // NOVO: Ubacite upload middleware pre updateDish kontrolera
    .put(protect, authorize('admin'), uploadSingleImage('dishImage'), updateDish)   
    .delete(protect, authorize('admin'), deleteDish);
module.exports = router;