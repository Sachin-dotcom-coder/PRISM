/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

// Connects to the 'Homepage' database where the Leaderboard collection lives
const HOMEPAGE_URI = process.env.MONGODB_HOMEPAGE_URI ||
  "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/Homepage?appName=PRISM";

declare global { var mongooseHomepage: any; }

let cached = global.mongooseHomepage;
if (!cached) cached = global.mongooseHomepage = { conn: null, promise: null };

async function dbConnectHomepage() {
  if (cached.conn) return cached.conn;
  if (!cached.promise)
    cached.promise = mongoose.createConnection(HOMEPAGE_URI, { bufferCommands: false }).asPromise();
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnectHomepage;
