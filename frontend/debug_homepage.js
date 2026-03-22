const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/Homepage?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to Homepage DB.");
    const db = client.db("Homepage");

    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(", "));

    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} docs`);
      if (count > 0) {
        const doc = await db.collection(coll.name).findOne();
        console.log(`  Example: ${JSON.stringify(doc).slice(0, 200)}...`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run();