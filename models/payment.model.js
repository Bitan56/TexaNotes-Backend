import mongoose from "mongoose";

const PaymentRequestSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    creditsRequested: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PaymentRequest = mongoose.model("PaymentRequest", PaymentRequestSchema);
export default PaymentRequest;