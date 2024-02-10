import { asyncHandler } from "../utils/asynchandler.js";

const registerUse = asyncHandler(async (req, res) => {
  res.status(200).json({
    messgae: "ok",
  });
});

export { registerUse };
