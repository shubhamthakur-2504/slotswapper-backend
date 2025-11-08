import { Router } from "express";
import { requestSwap, responseSwap, getAllSwappableEvents, incomingRequestSwap, outgoingRequestSwap } from "../controllers/swap.controller.js";
import { verifyJwtToken as auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/swap-request").post(auth, requestSwap)
router.route("/swap-response/:swapId").put(auth, responseSwap)
router.route("/swappable-slots").get(auth, getAllSwappableEvents)
router.route("/incoming-swaps").get(auth, incomingRequestSwap)
router.route("/outgoing-swaps").get(auth, outgoingRequestSwap)

export default router