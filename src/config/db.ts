import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Error connecting to MongoDB:", (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
