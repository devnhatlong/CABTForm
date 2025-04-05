const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var CommuneSchema = new mongoose.Schema({
    communeName: {
        type: String,
        required: true,
        unique: true,
    },
    communeCode: {
        type: String,
        default: "",
        trim: true,
    },
    districtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
        required: true,
    },
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Commune', CommuneSchema);
