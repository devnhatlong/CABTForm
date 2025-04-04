const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var ReportTypeSchema = new mongoose.Schema({
    reportTypeName: {
        type: String,
        required: true,
        trim: true,
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
module.exports = mongoose.model('ReportType', ReportTypeSchema);
