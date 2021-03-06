const mongoose = require("mongoose")

const tourSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique: [true, 'A tour must have a name']
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour; 