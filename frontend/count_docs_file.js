const { MongoClient } = require('mongodb');
const fs = require('fs');
const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  let report = "";
  try {
    await client.connect();
    const db = client.db("footballDB");
    const collections = await db.listCollections().toArray();
    report += `DB: footballDB\n`;
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      report += `${coll.name}: ${count}\n`;
    }
  } catch (err) {
    report += `Error: ${err.message}\n`;
  } finally {
    await client.close();
    fs.writeFileSync('db_report.txt', report);
  }
}
run();
