import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

const uploadOnCloudinary = async (locafilepath) => {
  try {
    if (!locafilepath) {
      return null;
    }

    const responce = await cloudinary.uploader.upload(locafilepath, {
      resource_type: "auto",
    });
    console.log("Cloudnary responce \n", responce);
    fs.unlinkSync(locafilepath);

    return responce;
  } catch (error) {
    fs.unlinkSync(locafilepath);
    return null;
  }
};

export { uploadOnCloudinary };
