const mongoose = require('mongoose');

const SocialOrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fieldOfWork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FieldOfWork',
            required: true,
        },
        incidentDate: {
            type: Date,
            required: true,
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true,
        },
        commune: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commune',
            required: true,
        },
        crime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crime',
            required: true,
        },
        reportContent: {
            type: String,
            required: true,
        },
        investigationResult: {
            type: String,
            enum: ['Đã điều tra làm rõ', 'Đang điều tra', 'Đình chỉ', 'Tạm đình chỉ'],
            required: true,
        },
        handlingResult: {
            type: String,
            enum: ['Đã khởi tố', 'Đã xử lý hành chính', 'Chuyển cơ quan khác', 'Chưa có kết quả'],
            required: true,
        },
        severityLevel: {
            type: String,
            enum: ['Nghiêm trọng và ít nghiêm trọng', 'Rất nghiêm trọng', 'Đặc biệt nghiêm trọng'],
            required: true,
        },
        isHandledByCommune: {
            type: Boolean,
            default: false,
        },
        isExtendedCase: {
            type: Boolean,
            default: false,
        },
        isGangRelated: {
            type: Boolean,
            default: false,
        },
        hasAssignmentDecision: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SocialOrder', SocialOrderSchema);