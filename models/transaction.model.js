import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    transactionId:{
        type: String,
        required: true,
        unique: true
    },
    userName:{
        type: String,
        required: true
    },
    creditedAmount:{
        type: String,
        required: true
    },
    Date:{
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model("Transaction", TransactionSchema)
export default Transaction