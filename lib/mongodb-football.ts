/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const FOOTBALL_URI = process.env.MONGODB_FOOTBALL_URI ||
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

declare global {
  var mongooseFootball: any;
}

let cached = global.mongooseFootball;
if (!cached) cached = global.mongooseFootball = { conn: null, promise: null };

async function dbConnectFootball() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(FOOTBALL_URI, { bufferCommands: false })
      .asPromise();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectFootball;
