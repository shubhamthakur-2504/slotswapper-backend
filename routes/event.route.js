import { Router } from "express";
import { createEvent, getEvents, deleteEvent, updateEvent, getAllEvents, enableSwap, disableSwap  } from "../controllers/event.controller.js";
import { verifyJwtToken as auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-event").post(auth, createEvent)

router.route("/get-events").get(auth, getEvents)
router.route("/get-all-events").get(auth, getAllEvents)

router.route("/delete-event/:eventId").delete(auth, deleteEvent)

router.route("/update-event/:eventId").put(auth, updateEvent)
router.route("/enable-swap/:eventId").put(auth, enableSwap)
router.route("/disable-swap/:eventId").put(auth, disableSwap)

export default router