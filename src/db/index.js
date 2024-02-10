import mongoose from "mongoose";

const connect_db = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`,
    );
    console.log(`\n Mongo DB connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Mongo DB connection failed error", error);
    process.exit(1);
  }
};

export default connect_db;
