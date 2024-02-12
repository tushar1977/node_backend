import { Router } from "express";
import {
  loginuser,
  logout_user,
  refreshAccessToken,
  registerUse,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUse,
);

router.route("/login").post(loginuser);

router.route("/logout").post(verifyJWT, logout_user);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
