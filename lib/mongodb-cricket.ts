/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const CRICKET_URI = process.env.mongodb_urlcricket ||
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/cricketDB?appName=PRISM";

declare global {
  var mongooseCricket: any;
}

let cached = global.mongooseCricket;
if (!cached) cached = global.mongooseCricket = { conn: null, promise: null };

async function dbConnectCricket() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .createConnection(CRICKET_URI, { bufferCommands: false })
      .asPromise();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectCricket;
