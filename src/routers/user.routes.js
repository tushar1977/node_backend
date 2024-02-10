import { Router } from "express";
import { registerUse } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUse);

export default router;
