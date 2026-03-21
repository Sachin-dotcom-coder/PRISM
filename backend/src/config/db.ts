import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
<<<<<<< Updated upstream
    const uri = process.env.MONGGODB_OTHERSPORTS_URI || process.env.mongodb_urlcricket || process.env.MONGO_URI || process.env.MONGODB_URI;
=======

    const uri = process.env.MONGGODB_OTHERSPORTS_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
>>>>>>> Stashed changes
    if (!uri) {
      throw new Error("MongoDB connection string is not defined");
    }
    console.log("MONGO_URI:", uri);
    await mongoose.connect(uri as string);
<<<<<<< Updated upstream
    console.log("MongoDB Connected to Database");
=======
    console.log("MongoDB Connected to Other Sports Database");
>>>>>>> Stashed changes
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;