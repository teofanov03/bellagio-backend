const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required.'],
      unique: true,
      trim: true,
    },
    imageUrl: {
        type: String, // Polje za putanju do slike
        default: '/images/default-dish.jpg' 
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Price must be a positive number.'],
      min: [0, 'Price must be a positive number.'],
    },
    category: {
      type: String,
      required: [true, 'Invalid dish category.'],
      enum: {
        values: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
        message: 'Invalid dish category.',
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dish', dishSchema);
