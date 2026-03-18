fetch("http://127.0.0.1:5000/api/volleyball", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    match_id: `volley_test_${Date.now()}`,
    category: "boys",
    stage: "league",
    dept_name1: "CS",
    dept_name2: "EC"
  })
})
.then(res => res.json())
.then(data => {
  console.log("Volleyball POST response:");
  console.log(data);
})
.catch(console.error);
