const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db("footballDB");
    
    console.log("DB Context:", db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(", "));

    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`- ${coll.name}: ${count} docs`);
      if (count > 0) {
        const doc = await db.collection(coll.name).findOne();
        console.log(`  Example from ${coll.name}:`, JSON.stringify(doc).slice(0, 200) + "...");
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
