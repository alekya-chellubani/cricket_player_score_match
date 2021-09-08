const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
convertToList = (item) => {
  return {
    playerId: item.player_id,
    playerName: item.player_name,
  };
};
//GET player details API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((eachItem) => convertToList(eachItem)));
});
//GET specific player API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertToList(player));
});
//PUT player API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerPutQuery = `
    UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`;
  await db.run(playerPutQuery);
  response.send("Player Details Updated");
});
const changeToList = (item) => {
  return {
    matchId: item.match_id,
    match: item.match,
    year: item.year,
  };
};
//GET specific match API
app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
      match_id=${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(changeToList(match));
});
//GET playerId-Matches API
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
    SELECT
      *
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE
      player_id = ${playerId};`;
  const match = await db.all(getPlayerMatchQuery);
  console.log(match);
  response.send(match.map((eachItem) => changeToList(eachItem)));
});
//GET Matches-playerId API
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayerQuery = `
    SELECT
      *
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      match_id = ${matchId};`;
  const player = await db.all(getMatchPlayerQuery);
  response.send(player.map((eachItem) => convertToList(eachItem)));
});
//get total stats of specific player
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getPlayerScoreQuery);
  response.send(player);
});
module.exports = app;
