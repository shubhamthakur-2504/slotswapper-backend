import mongoose from "mongoose"
import { Event } from "../models/event.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { checkEventOverlap, updateEventStatuses } from "../utils/eventHelper.js"


const createEvent = asyncHandler(async (req, res) => {
    const { title, startTime, endTime } = req.body
    startTime = new Date(startTime)
    endTime = new Date(endTime)

    if (!title || !startTime || !endTime) {
        throw new apiError(400, "All fields are required")
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw new apiError(400, "Start time cannot be greater than end time")
    }

    if (startTime <= new Date() || endTime <= new Date()) {
        throw new apiError(400, "Can not create event in the past");
    }

    await checkEventOverlap(req.user._id, startTime, endTime)

    try {
        const event = await Event.create({ title, startTime, endTime, owner: req.user._id })

        return res.status(201).json(new apiResponse(201, event, "Event created successfully"))

    } catch (error) {
        throw new apiError(500, "Something went wrong while creating event")
    }
})


const getEvents = asyncHandler(async (req, res) => {
    try {
        let events = await Event.find({ owner: req.user._id })

        events = await updateEventStatuses(events)

        return res.status(200).json(new apiResponse(200, events, "Events fetched successfully"))
    } catch (error) {
        throw new apiError(500, "Something went wrong while fetching events")
    }
})

const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params

    if (!mongoose.isValidObjectId(eventId)) {
        return res.status(404).json(new apiResponse(404, null, "Invalid event id"));
    }

    try {
        const event = await Event.findById(eventId)

        if (!event) {
            throw new apiError(404, "Event not found")
        }

        if (event.owner.toString() !== req.user._id.toString()) {
            throw new apiError(403, "You are not authorized to delete this event")
        }

        await event.deleteOne()

        return res.status(200).json(new apiResponse(200, event, "Event deleted successfully"))
    } catch (error) {
        throw new apiError(500, "Something went wrong while deleting event")
    }
})

const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params
    const { title, startTime, endTime } = req.body

    if (!mongoose.isValidObjectId(eventId)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    if (!title && !startTime && !endTime) {
        throw new apiError(400, "At least one field is required")
    }
    if (startTime) {
        startTime = new Date(startTime)
    }
    if (endTime) {
        endTime = new Date(endTime)
    }
    if (startTime && endTime && startTime >= endTime) {
        throw new apiError(400, "Start time must be before end time");
    }

    if ((startTime && startTime < new Date()) || (endTime && endTime < new Date())) {
        throw new apiError(400, "Can not update event in the past");
    }


    try {
        const event = await Event.findById(eventId)

        if (!event) {
            throw new apiError(404, "Event not found")
        }
        if (event.owner.toString() !== req.user._id.toString()) {
            throw new apiError(403, "You are not authorized to update this event")
        }

        if (startTime && new Date(startTime) >= new Date(event.endTime)) {
            throw new apiError(400, "Start time cannot be greater than or equal to current end time");
        }

        if (endTime && new Date(event.startTime) >= new Date(endTime)) {
            throw new apiError(400, "End time cannot be less than or equal to current start time");
        }

        await checkEventOverlap(req.user._id, startTime || event.startTime, endTime || event.endTime, eventId)

        event.title = title || event.title
        event.startTime = startTime || event.startTime
        event.endTime = endTime || event.endTime

        const updatedEvent = await event.save()

        return res.status(200).json(new apiResponse(200, updatedEvent, "Event updated successfully"))
    } catch (error) {
        throw new apiError(500, "Something went wrong while updating event")
    }
})

const getAllEvents = asyncHandler(async (req, res) => {
    try {
        let events = await Event.find()

        events = await updateEventStatuses(events)

        return res.status(200).json(new apiResponse(200, events, "Events fetched successfully"))
    } catch (error) {
        throw new apiError(500, "Something went wrong while fetching events")
    }
})


const enableSwap = asyncHandler(async (req, res) => {
    const { eventId } = req.params

    if (!mongoose.isValidObjectId(eventId)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    const event = await Event.findById(eventId)

    if (!event) {
        throw new apiError(404, "Event not found")
    }

    if (event.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not authorized to update this event")
    }

    try {
        if (event.status === "BUSY") {
            event.status = "SWAPPABLE"
            const updatedEvent = await event.save()
    
            return res.status(200).json(new apiResponse(200, updatedEvent, "Event updated successfully"))
        } else {
            throw new apiError(400, "Event is not busy")
        }
    } catch (error) {
        throw new apiError(500, "Something went wrong while updating event")
    }
})


const disableSwap = asyncHandler(async (req, res) => {
    const { eventId } = req.params

    if (!mongoose.isValidObjectId(eventId)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    const event = await Event.findById(eventId)

    if (!event) {
        throw new apiError(404, "Event not found")
    }

    if (event.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not authorized to update this event")
    }

    try {
        if (event.status === "SWAPPABLE" || event.status === "SWAP_PENDING") {
            event.status = "BUSY"
            const updatedEvent = await event.save()
    
            return res.status(200).json(new apiResponse(200, updatedEvent, "Event updated successfully"))
        } else {
            if (event.status === "COMPLETED") {
                throw new apiError(400, "Event is already completed")
            } else {
                throw new apiError(400, "Event is already busy")
            }
        }
    } catch (error) {
        throw new apiError(500, "Something went wrong while updating event")
    }
})


export { createEvent, getEvents, deleteEvent, updateEvent, getAllEvents, enableSwap, disableSwap }