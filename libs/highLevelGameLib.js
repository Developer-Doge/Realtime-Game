import { get, ref, set } from "firebase/database";
import { useRecoilState } from "recoil";
import { isInGame } from "../global/recoilState";
import { database } from "./realtime";

// Join game using Id

export const joinGame = (gameId, playerName) => {
  const dbRef = ref(database, `games/${gameId}/players`);
  const scoresRef = ref(database, `games/${gameId}/scores`);

  // Get current players and scores
  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        // Add player to current players
        const players = snapshot.val();
        players.push(playerName);
        set(dbRef, players);

        // Add score for the new player
        get(scoresRef)
          .then((scoresSnapshot) => {
            if (scoresSnapshot.exists()) {
              const scores = scoresSnapshot.val();
              scores[playerName] = 0; // Initialize score to 0
              set(scoresRef, scores);
            } else {
              // No scores exist, create a new object with the new player's score
              set(scoresRef, { [playerName]: 0 });
            }
          })
          .catch((error) => {
            console.error(error);
          });

        // Update isInGame recoil state
      } else {
        // Create new player
        set(dbRef, [playerName]);

        // Create new scores object with the new player's score
        set(scoresRef, { [playerName]: 0 });

        // Update the isInGame recoil state
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const setScore = (gameId, playerName, score) => {
  const scoresRef = ref(database, `games/${gameId}/scores/${playerName}`);
  set(scoresRef, score).catch((error) => {
    console.error(error);
  });
};

export const addScore = (gameId, playerName, score) => {
  const scoresRef = ref(database, `games/${gameId}/scores/${playerName}`);
  get(scoresRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentScore = snapshot.val();
        setScore(gameId, playerName, currentScore + score); // Update score using setScore function
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateState = (gameId, state) => {
  const dbRef = ref(database, `games/${gameId}/state`);
  set(dbRef, state);
  console.log(`state updated to ` + state);
};

export const readGameState = (gameId) => {
  const dbRef = ref(database, `games/${gameId}/state`);
  const data = get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return data;
};

// Read scores
export const readScores = (gameId, playerName) => {
  const dbRef = ref(database, `games/${gameId}/scores/${playerName}/`);
  const data = get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return {};
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return data;
};
