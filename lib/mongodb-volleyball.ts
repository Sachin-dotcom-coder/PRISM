/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const VOLLEYBALL_URI = process.env.MONGODB_VOLLEYBALL_URI ||
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/volleyballDB?appName=PRISM";

declare global {
  var mongooseVolleyball: any;
}

let cached = global.mongooseVolleyball;
if (!cached) cached = global.mongooseVolleyball = { conn: null, promise: null };

async function dbConnectVolleyball() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(VOLLEYBALL_URI, { bufferCommands: false })
      .asPromise();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectVolleyball;
