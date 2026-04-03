async function checkDodgersBetter() {
  const url = `https://statsapi.mlb.com/api/v1/teams/119/stats?stats=season&group=hitting&season=2026`;
  const res = await fetch(url);
  const data = await res.json();
  const st = data.stats?.[0]?.splits?.[0]?.stat;
  if(st) {
    console.log("Team: Dodgers");
    console.log("Hits:", st.hits);
    console.log("At Bats:", st.atBats);
    console.log("AVG returned:", st.avg);
    if (st.atBats > 0) {
      console.log("Calculated AVG:", (st.hits / st.atBats).toFixed(3));
    }
  }
}
checkDodgersBetter();
