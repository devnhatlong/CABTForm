const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var DepartmentSchema = new mongoose.Schema({
    departmentCode: {
        type:String,
        // unique: true
    },
    departmentName: {
        type:String,
        // unique: true
    },
    departmentType: {
        type:String,
        // unique: true
    }
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Department', DepartmentSchema);