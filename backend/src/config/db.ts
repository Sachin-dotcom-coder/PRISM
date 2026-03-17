import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    console.log("MONGO_URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;