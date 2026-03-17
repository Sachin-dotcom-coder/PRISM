const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Vishal:VISHAL2006@prism.mczk5vc.mongodb.net/footballDB?appName=PRISM";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("footballDB");
    
    // Test Teams
    const maleTeam = {
      name: "Male Warriors",
      shortName: "MWA",
      wins: 2,
      draws: 1,
      losses: 0,
      goalsFor: 5,
      goalsAgainst: 1,
      goalDifference: 4,
      points: 7,
      matches: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const femaleTeam = {
      name: "Female Titans",
      shortName: "FTI",
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

    await db.collection("teams_m").updateOne({ name: maleTeam.name }, { $set: maleTeam }, { upsert: true });
    await db.collection("teams_f").updateOne({ name: femaleTeam.name }, { $set: femaleTeam }, { upsert: true });

    // Test Matches
    const maleMatch = {
      match_id: "m_test_1",
      sport: "football",
      status: "COMPLETED",
      teams: { team1: "Team A", team2: "Team B" },
      score: { team1: 2, team2: 1 },
      goals: [],
      result: { winner: "Team A", final_score: "2-1" },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const femaleMatch = {
      match_id: "f_test_1",
      sport: "football",
      status: "LIVE",
      teams: { team1: "Team X", team2: "Team Y" },
      score: { team1: 0, team2: 0 },
      goals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("matches").updateOne({ match_id: maleMatch.match_id }, { $set: maleMatch }, { upsert: true });
    await db.collection("matches_f").updateOne({ match_id: femaleMatch.match_id }, { $set: femaleMatch }, { upsert: true });

    console.log("Injected test data for both genders.");
  } finally {
    await client.close();
  }
}
run();
