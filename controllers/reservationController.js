const Reservation = require('../models/Reservation');

// ----------------------------------------------------
// JAVNA RUTA (Klijenti kreiraju novu rezervaciju)
// @desc    Create new reservation
// @route   POST /api/reservations
// ----------------------------------------------------
exports.createReservation = async (req, res) => {
    try {
        // Kreiranje novog objekta Reservation iz podataka u telu zahteva (req.body)
        const newReservation = await Reservation.create(req.body);

        // Status 201: Created
        res.status(201).json({ 
            success: true, 
            data: newReservation, 
            message: 'Reservation submitted successfully. You will receive a confirmation shortly.' 
        });

    } catch (error) {
        // Mongoose error (Input Validation Error)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            // Status 400: Bad Request
            return res.status(400).json({ 
                success: false, 
                error: messages.join(', ') 
            });
        }
        // Status 500: Server Error
        res.status(500).json({ success: false, error: 'Server Error. Please try again.' });
    }
};

// ----------------------------------------------------
// PRIVATNA RUTA (Admin pregleda sve rezervacije)
// Implementiraćemo Autentifikaciju u sledećem koraku!
// ----------------------------------------------------
exports.getReservations = async (req, res) => {
    // NAPOMENA: Ovde će doći middleware za proveru Admina!
    try {
        const reservations = await Reservation.find().sort({ date: 1 });
        res.status(200).json({ success: true, count: reservations.length, data: reservations });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error: Cannot retrieve reservations.' });
    }
};

// @desc    GET all reservations (Admin access)
// @route   GET /api/reservations
exports.getReservations = async (req, res) => {
    try {
        // Sortiramo po datumu, a zatim po statusu (Pending dolazi prvi)
        const reservations = await Reservation.find().sort({ date: 1, status: 1 });
        
        res.status(200).json({ 
            success: true, 
            count: reservations.length, 
            data: reservations 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error: Cannot retrieve reservations.' });
    }
};
// @desc    Update reservation status (Admin access)
// @route   PUT /api/reservations/:id
exports.updateReservationStatus = async (req, res) => {
    try {
        // Dozvoljavamo Adminu da promeni samo 'status'
        const { status } = req.body; 

        if (!status) {
            return res.status(400).json({ success: false, error: 'Please provide a new status.' });
        }

        const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true // Proverava da li je status validan (Pending/Confirmed/Cancelled)
        });

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found.' });
        }

        res.status(200).json({ 
            success: true, 
            data: reservation, 
            message: `Reservation status updated to: ${status}.` 
        });

    } catch (error) {
        // Rukovanje greškama validacije (ako je status neispravan)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                error: messages.join(', ') 
            });
        }
        res.status(500).json({ success: false, error: 'Server Error during reservation status update.' });
    }
};
// @desc    Delete reservation (Admin access)
// @route   DELETE /api/reservations/:id
exports.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);

        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Reservation not found for deletion.' });
        }
        
        res.status(200).json({ success: true, data: {}, message: 'Reservation deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error during reservation deletion.' });
    }
};