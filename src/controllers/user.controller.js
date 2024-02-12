import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { restart } from "nodemon";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken();

    user.refresh_token = refresh_token;
    await user.save({ validateBeforeSave: false });

    return { access_token, refresh_token };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const registerUse = asyncHandler(async (req, res) => {
  //1) fronted se data
  //2) user, email, avtar, pass, fullname
  //3) validation
  //4) check if user already exist by username, email
  //5) check for images avtar
  //6) upload them to cloudnary, avtar check
  //7) create user object
  //8) remove pass and refresh token from field
  //9) check for responce
  //10) return responce

  //1)
  const { fullname, username, email, password } = req.body;

  //2)
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //3,4
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  //console.log("existed user :- \n", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User Already Exit");
  }

  //console.log("req files \n", req.files);

  //5

  const localPath = req.files?.avatar[0]?.path;

  const coverImagePath = req.files?.coverImage[0]?.path;

  if (!localPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //6
  const avatar_uploaded = await uploadOnCloudinary(localPath);
  const cover_uploaded = await uploadOnCloudinary(coverImagePath);

  if (!avatar_uploaded) {
    throw new ApiError(409, "Avatar required");
  }

  //7
  const user_db = await User.create({
    fullname,
    avatar: avatar_uploaded.url,
    coverImage: cover_uploaded?.url || "",

    email,
    password,
    username: username.toLowerCase(),
  });

  //8
  const user_created = await User.findById(user_db._id).select(
    "-password -refreshToken",
  );

  if (!user_created) {
    throw new ApiError(
      500,
      "Something went wrong with server while registeringa",
    );
  }

  //10
  return res
    .status(201)
    .json(new ApiResponse(200, user_created, "User registered"));
});

const loginuser = asyncHandler(async (req, res) => {
  //req->data
  //1) check for empty user and pass
  //2) check for password, username
  ////checl for user
  //3) generate access and refresh token
  //4) send cookie
  //5) responce

  const { email, username, password } = req.body;

  if (!email || !username) {
    throw new ApiError(400, "Please enter username or password");
  }

  //3

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User not Found! Please register first");
  }

  const pass_login = await user.isPasswordCorrect(password);

  if (!pass_login) {
    throw new ApiError(401, "Password is Incorrect");
  }

  const { access_token, refresh_token } = await generateAccessAndRefreshToken(
    user._id,
  );

  const logg_user = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", access_token, options)
    .cookie("refreshToken", refresh_token, options)
    .json(
      new ApiResponse(
        200,
        { user: logg_user, access_token, refresh_token },
        "user logged in success",
      ),
    );
});

const logout_user = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggout out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //1) get token, 2) verify and get decorded, 3) find in database that token 4) if found then generate token

  const incoming_token = req.cookies.refreshToken || req.body.refreshToken;

  if (!incoming_token) {
    throw new ApiError(404, "Unauthorized token");
  }

  try {
    const decorded_token = jwt.verify(
      incoming_token,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user_found = await User.findById(decorded_token?._id);

    if (!user_found) {
      throw new ApiError(404, "Invlid Refresh Token");
    }

    if (incoming_token !== user_found?.refreshToken) {
      throw new ApiError(404, "Refresh token is expired");
    }

    const options = { httpOnly: true, secure: true };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user_found?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUse, loginuser, logout_user, refreshAccessToken };
