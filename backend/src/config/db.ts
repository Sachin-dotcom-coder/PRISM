import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
<<<<<<< Updated upstream
    const uri = process.env.MONGGODB_OTHERSPORTS_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MongoDB connection string is not defined (MONGGODB_OTHERSPORTS_URI or MONGO_URI or MONGODB_URI)");
    }
    console.log("MONGO_URI:", uri);
    await mongoose.connect(uri as string);
    console.log("MongoDB Connected to Other Sports Database");
=======
    const uri = process.env.mongodb_urlcricket;
    if (!uri) {
      throw new Error("MongoDB connection string is not defined (mongodb_urlcricket)");
    }
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
>>>>>>> Stashed changes
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;