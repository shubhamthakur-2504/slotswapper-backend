import { Router } from "express";
import { requestSwap, responseSwap, getAllSwappableEvents } from "../controllers/swap.controller";
import { verifyJwtToken as auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/swap-request").post(auth, requestSwap)
router.route("/swap-response/:swapId").put(auth, responseSwap)
router.route("/swappable-slots").get(auth, getAllSwappableEvents)

export default router