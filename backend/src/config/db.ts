import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGGODB_OTHERSPORTS_URI || process.env.MONGODB_HOMEPAGE_URI || process.env.mongodb_urlcricket || process.env.MONGODB_URI || process.env.mongodb_url || process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MongoDB connection string is not defined");
    }
    console.log("MONGO_URI:", uri);
    await mongoose.connect(uri as string);
    console.log("MongoDB Connected to Database");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;