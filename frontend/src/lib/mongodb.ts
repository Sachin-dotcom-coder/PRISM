/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

const MONGODB_URLCRICKET = process.env.mongodb_urlcricket;
const MONGODB_FOOTBALL_URI = process.env.MONGODB_FOOTBALL_URI;
const MONGODB_HOMEPAGE_URI = process.env.MONGODB_HOMEPAGE_URI;

declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    cricket: { conn: null, promise: null },
    football: { conn: null, promise: null },
    homepage: { conn: null, promise: null },
  };
}

async function connectToDatabase(uri: string, key: 'cricket' | 'football' | 'homepage') {
  if (!uri) {
    console.error(`[MongoDB] Error: URI for ${key} is undefined!`);
    throw new Error(`MongoDB URI for ${key} is missing`);
  }

  if (cached[key].conn) {
    return cached[key].conn;
  }

  if (!cached[key].promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log(`[MongoDB] Opening new connection for: ${key}...`);
    cached[key].promise = mongoose.createConnection(uri, opts).asPromise().then((conn) => {
      console.log(`[MongoDB] ${key} connection established.`);
      return conn;
    }).catch(err => {
      console.error(`[MongoDB] ${key} connection error:`, err.message);
      cached[key].promise = null; // Reset for retry
      throw err;
    });
  }
  cached[key].conn = await cached[key].promise;
  return cached[key].conn;
}

export async function dbConnectCricket() {
  return connectToDatabase(MONGODB_URLCRICKET!, 'cricket');
}

export async function dbConnectFootball() {
  return connectToDatabase(MONGODB_FOOTBALL_URI!, 'football');
}

export async function dbConnectHomepage() {
  return connectToDatabase(MONGODB_HOMEPAGE_URI!, 'homepage');
}
