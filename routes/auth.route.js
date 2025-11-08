import { Router } from "express";
import { register, login, refreshAccessToken, logout, getUser } from "../controllers/auth.controller.js";
import {verifyJwtToken as auth} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/logout").post(auth, logout)
router.route("/get-user").get(auth, getUser)

export default router