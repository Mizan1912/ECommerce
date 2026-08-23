import mongoose from "mongoose";

const processedEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        unique: true,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days in seconds
    }
});

const ProcessedEvent = mongoose.model("ProcessedEvent", processedEventSchema);

export default ProcessedEvent;
