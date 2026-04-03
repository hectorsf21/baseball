async function checkDodgers() {
  const url = `https://statsapi.mlb.com/api/v1/teams/119/stats?stats=season&group=hitting&season=2026`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Dodgers Hitting Stats:", JSON.stringify(data, null, 2));
}
checkDodgers();
