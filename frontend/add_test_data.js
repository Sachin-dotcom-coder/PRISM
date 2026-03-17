const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("footballDB");
    const teams = db.collection("teams_m");
    
    const testTeam = {
      name: "Test Team Alpha",
      shortName: "TTA",
      wins: 1,
      draws: 0,
      losses: 0,
      goalsFor: 2,
      goalsAgainst: 0,
      goalDifference: 2,
      points: 3,
      matches: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await teams.insertOne(testTeam);
    console.log("Inserted test team with id:", result.insertedId);
  } finally {
    await client.close();
  }
}
run();
