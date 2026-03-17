import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.mongodb_urlcricket;
    if (!uri) {
      throw new Error("MongoDB connection string is not defined (MONGO_URI or MONGODB_URI or mongodb_urlcricket)");
    }
    console.log("MONGO_URI:", uri);
    await mongoose.connect(uri as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;