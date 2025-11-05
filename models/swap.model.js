import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // who initiated
    responder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // owner of requested slot
    mySlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }, // offered by requester
    theirSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }, // requested slot
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING"
    }
}, { timestamps: true });

export const Swap = mongoose.model('Swap', swapSchema);
