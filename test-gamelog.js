async function testGameLog() {
  const personId = "677551"; // Juan Soto o similar
  const url = `https://statsapi.mlb.com/api/v1/people/${personId}/stats?stats=gameLog&group=hitting&season=2026`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.stats && data.stats[0].splits) {
    const splits = data.stats[0].splits;
    console.log(`Found ${splits.length} games for player`);
    const lastGame = splits[0]; // Usually returned in reverse order? Check.
    console.log("Date:", lastGame.date);
    console.log("Hits:", lastGame.stat.hits);
    console.log("Opponent:", lastGame.opponent.name);
  } else {
    console.log("No game log found");
  }
}
testGameLog();
