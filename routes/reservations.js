const express = require('express');
const router = express.Router();


// Javna ruta za kreiranje rezervacije

const { 
    createReservation, getReservations, updateReservationStatus, deleteReservation 
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth'); // UVEZENO

// Javna ruta
router.route('/')
    .post(createReservation) // Javno slanje rezervacije
    .get(protect, authorize('admin'), getReservations); // ZAŠTIĆENA RUTA ZA PREGLED

router.route('/:id')
    .put(protect, authorize('admin'), updateReservationStatus) // ZAŠTIĆENA RUTA ZA PROMENU STATUSA
    .delete(protect, authorize('admin'), deleteReservation); // ZAŠTIĆENA RUTA ZA BRISANJE

module.exports = router;