import { Router } from "express";
import {
  changeCurrentPassword,
  getUserDetails,
  loginuser,
  logout_user,
  refreshAccessToken,
  registerUse,
  updateAvatar,
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

router.route("/getUser").get(getUserDetails);

router.route("/changepass").post(verifyJWT, changeCurrentPassword);

router.route("/changeavatar").post(updateAvatar);

export default router;
