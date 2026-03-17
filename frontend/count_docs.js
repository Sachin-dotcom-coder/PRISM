const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("footballDB");
    const collections = await db.listCollections().toArray();
    console.log("DB: footballDB");
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`${coll.name}: ${count}`);
    }
  } finally {
    await client.close();
  }
}
run();
