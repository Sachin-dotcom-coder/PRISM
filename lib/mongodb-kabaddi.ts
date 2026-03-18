/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const KABADDI_URI = process.env.MONGODB_KABADDI_URI ||
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/kabaddiDB?appName=PRISM";

declare global {
  var mongooseKabaddi: any;
}

let cached = global.mongooseKabaddi;
if (!cached) cached = global.mongooseKabaddi = { conn: null, promise: null };

async function dbConnectKabaddi() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(KABADDI_URI, { bufferCommands: false })
      .asPromise();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectKabaddi;
