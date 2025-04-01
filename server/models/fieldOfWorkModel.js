const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var FieldOfWorkSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: true,
        trim: true
    },
    fieldCode: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    }
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('FieldOfWork', FieldOfWorkSchema);
