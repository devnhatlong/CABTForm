const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var TopicSchema = new mongoose.Schema({
    crimeName: {
        type: String,
        required: true,
        trim: true,
    },
    crimeCode: {
        type: String,
        required: true,
        trim: true,
    },
    fieldCode: {
        type: String,
        required: true,
        trim: true,
        ref: 'FieldOfWork',
    },
    description: {
        type: String,
        default: "",
        trim: true,
    }
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Topic', TopicSchema);
