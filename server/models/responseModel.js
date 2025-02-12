const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
        {
            fieldLabel: { type: String, required: true },
            value: { type: mongoose.Schema.Types.Mixed, required: true }
        }
    ],
    submittedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model("Response", responseSchema);
