const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fields: [
        {
            label: { type: String, required: true },
            type: { 
                type: String, 
                required: true, 
                enum: ["text", "number", "email", "radio", "checkbox", "select", "date", "textarea"] 
            },
            
            options: [{ type: String }],
            required: { type: Boolean, default: false },

            placeholder: { type: String },
            defaultValue: { type: mongoose.Schema.Types.Mixed },
            
            minLength: { type: Number },
            maxLength: { type: Number },
            pattern: { type: String },

            min: { type: Number },
            max: { type: Number },
            step: { type: Number },
            
            multiple: { type: Boolean, default: false },
        }
    ],
    link: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model("Form", formSchema);
