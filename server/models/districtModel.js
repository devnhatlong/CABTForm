const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var DistrictSchema = new mongoose.Schema({
    districtName: {
        type: String,
        required: true,
        unique: true,
    },
    districtCode: {
        type: String,
        default: "",
        trim: true,
    },
    provinceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
        required: true,
    },
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('District', DistrictSchema);
