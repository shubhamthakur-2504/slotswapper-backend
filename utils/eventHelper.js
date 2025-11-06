
import { Event } from "../models/event.model.js";
import apiError from "../utils/apiError.js";

const updateEventStatuses = async (events) => {
    const now = new Date();
    const updates = [];

    for (const event of events) {
        if (event.status === "COMPLETED") continue;

        if (event.startTime < now && event.endTime > now && (event.status === "SWAPPABLE" || event.status === "SWAP_PENDING")) {
            event.status = "BUSY";
            updates.push(event.save());
        } else if (event.endTime < now && ["SWAPPABLE", "SWAP_PENDING", "BUSY"].includes(event.status)) {
            event.status = "COMPLETED";
            updates.push(event.save());
        }
    }

    await Promise.all(updates);
    return events;
};

const checkEventOverlap = async (ownerId, startTime, endTime, eventId = null, message = "") => {
    const query = {
        owner: ownerId,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    };

    if (eventId) query._id = { $ne: eventId }; // exclude current event in updates

    const overlap = await Event.findOne(query);

    if (overlap) {
        throw new apiError(
            400,
            `${message} Event overlaps with another event: ${overlap.title} (${overlap.startTime} - ${overlap.endTime})`
        );
    }
    
    return
};

export { updateEventStatuses, checkEventOverlap };