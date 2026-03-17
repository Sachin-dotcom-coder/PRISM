const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("footballDB");
    
    console.log("Checking collections in footballDB...");
    const teams_m = await db.collection("teams_m").find({}).toArray();
    console.log(`teams_m count: ${teams_m.length}`);
    if (teams_m.length > 0) {
      console.log("First team in teams_m:", JSON.stringify(teams_m[0], null, 2));
    }

    const matches = await db.collection("matches").find({}).toArray();
    console.log(`matches count: ${matches.length}`);
    
    // Also check for 'teams' just in case
    const teams = await db.collection("teams").find({}).toArray();
    console.log(`teams count: ${teams.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
