import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { Swap } from "../models/swap.model.js";
import { Event } from "../models/event.model.js";
import { checkEventOverlap } from "../utils/eventHelper.js";

const requestSwap = asyncHandler(async (req, res) => {
    const { eventId, targetEventId } = req.body;

    // Validate both event IDs
    if (!eventId || !targetEventId) {
        throw new apiError(400, "Both event IDs are required");
    }

    // Fetch both events
    const requesterEvent = await Event.findById(eventId);
    const targetEvent = await Event.findById(targetEventId);

    if (!requesterEvent || !targetEvent) {
        throw new apiError(404, "One or both events not found");
    }

    if (requesterEvent.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only request swaps for your own events");
    }

    if (requesterEvent.status !== "SWAPPABLE" || targetEvent.status !== "SWAPPABLE") {
        throw new apiError(400, "Both events must be swappable to request a swap");
    }
    //check if the request for swap aready exist
    const existingSwap = await Swap.findOne({
        mySlot: requesterEvent._id,
        theirSlot: targetEvent._id,
        status: "PENDING"
    });

    if (existingSwap) {
        throw new apiError(400, "A swap request for these events already exists");
    }
    // check overlap with other requester's events
    await checkEventOverlap(req.user._id, targetEvent.startTime, targetEvent.endTime)

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [swapEvent] = await Swap.create([{
            requester: req.user._id,
            responder: targetEvent.owner,
            mySlot: requesterEvent._id,
            theirSlot: targetEvent._id
        }], { session });

        if (swapEvent) {
            await requesterEvent.updateOne({ status: "SWAP_PENDING" }, { session });
            await targetEvent.updateOne({ status: "SWAP_PENDING" }, { session });
        }

        await session.commitTransaction();
        res.status(200).json(new apiResponse(200, swapEvent, "Swap request sent successfully"));
    } catch (error) {
        await session.abortTransaction();
        throw new apiError(500, "Something went wrong while requesting a swap");
    } finally {
        session.endSession();
    }
});



const responseSwap = asyncHandler(async (req, res) => {
    const { swapId } = req.params;
    let { accept } = req.body;

    if (!mongoose.isValidObjectId(swapId)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid swap id"));
    }
    if (!accept) {
        throw new apiError(400, "Acceptance status is required");
    }

    if (accept === "true") {
        accept = true;
    } else if (accept === "false") {
        accept = false;
    } else {
        throw new apiError(400, "Acceptance status must be true or false");
    }

    // Fetch swap and populate event details
    const swap = await Swap.findById(swapId).populate("mySlot").populate("theirSlot");

    if (!swap) {
        throw new apiError(404, "Swap not found");
    }

    if (swap.status !== "PENDING") {
        throw new apiError(400, "This swap has already been processed");
    }

    if (swap.responder.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not authorized to accept this swap");
    }

    if (swap.mySlot.status !== "SWAP_PENDING") {
        throw new apiError(400, "Requester's event is not swappable now");
    }

    if (swap.theirSlot.status !== "SWAP_PENDING") {
        throw new apiError(400, "Your event is not swappable now");
    }

    const requesterEvent = swap.mySlot;
    const targetEvent = swap.theirSlot;

    // Validate events still exist
    if (!requesterEvent || !targetEvent) {
        throw new apiError(404, "One or both events no longer exist");
    }

    if (accept) {
        // Check overlap for responder (if they take requester’s slot)
        await checkEventOverlap(
            req.user._id,
            requesterEvent.startTime,
            requesterEvent.endTime,
            targetEvent._id,
            "For you this"
        );

        // Check overlap for requester (if they take responder’s slot)
        await checkEventOverlap(
            swap.requester,
            targetEvent.startTime,
            targetEvent.endTime,
            requesterEvent._id,
            "For them this"
        );
        const session = await mongoose.startSession();
        session.startTransaction();
        //  Swap ownership
        try {
            requesterEvent.owner = swap.responder;
            targetEvent.owner = swap.requester;
            requesterEvent.status = "BUSY";
            targetEvent.status = "BUSY";

            await requesterEvent.save();
            await targetEvent.save();

            // Update swap status
            swap.status = "ACCEPTED";
            await swap.save();

            await session.commitTransaction();
            return res.status(200).json(new apiResponse(200, swap, "Swap accepted successfully"));
        } catch (error) {
            await session.abortTransaction();
            throw new apiError(500, "Something went wrong while accepting the swap");
        } finally {
            session.endSession();
        }
    } else {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Update swap status
            swap.status = "REJECTED";
            await swap.save();

            await requesterEvent.updateOne({ status: "SWAPPABLE" });
            await targetEvent.updateOne({ status: "SWAPPABLE" });

            await session.commitTransaction();
            return res.status(200).json(new apiResponse(200, swap, "Swap rejected successfully"));
        } catch (error) {
            await session.abortTransaction();
            throw new apiError(500, "Something went wrong while rejecting the swap");
        } finally {
            session.endSession();
        }
    }
});


const getAllSwappableEvents = asyncHandler(async (req, res) => {
    const swappableEvents = await Event.find({ status: "SWAPPABLE", owner: { $ne: req.user._id } }).select("-__v -updatedAt -createdAt").populate({
        path: "owner",
        select: "-__v -updatedAt -createdAt -passwordHash -refreshToken -email"
    });;
    return res.status(200).json(new apiResponse(200, swappableEvents, "Swappable events fetched successfully"));
});


const incomingRequestSwap = asyncHandler(async (req, res) => {
    const incomingSwaps = await Swap.find({ responder: req.user._id }).populate([
        {
            path: "mySlot",
            select: "-__v -updatedAt -createdAt"
        },
        {
            path: "theirSlot",
            select: "-__v -updatedAt -createdAt"
        },
        {
            path: "requester",
            select: "-__v -updatedAt -createdAt -passwordHash -refreshToken -email"
        }
    ]);
    return res.status(200).json(new apiResponse(200, incomingSwaps, "Incoming swap requests fetched successfully"));
});

const outgoingRequestSwap = asyncHandler(async (req, res) => {
    const outgoingSwaps = await Swap.find({ requester: req.user._id }).select("-__v -updatedAt -createdAt -requester").populate([
        {
            path: "mySlot",
            select: "-__v -updatedAt -createdAt"
        },
        {
            path: "theirSlot",
            select: "-__v -updatedAt -createdAt"
        },
        {
            path: "responder",
            select: "-__v -updatedAt -createdAt -passwordHash -refreshToken -email"
        }
    ])
    return res.status(200).json(new apiResponse(200, outgoingSwaps, "Outgoing swap requests fetched successfully"));
});

export { requestSwap, responseSwap, getAllSwappableEvents, incomingRequestSwap, outgoingRequestSwap }