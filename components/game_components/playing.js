import { useState, useEffect } from "react";
import { readGameState, readScores } from "../../libs/highLevelGameLib";

export default function GameState_Playing({ game, player }) {
  const [gameState, setGameState] = useState();
  const [scores, setScores] = useState({});

  useEffect(() => {
    // Get the game state from the game ref in the parameter
    readGameState(player.gameId).then((state) => {
      setGameState(state);
    });

    // Listen for changes to the scores in the database and update the state
    readScores(player.gameId, player.username).then((scoresData) => {
      setScores(scoresData);
    });

    // Unsubscribe from the scoresRef when the component unmounts
    return () => {
      readScores(player.gameId, player.username, false);
    };
  }, [game, player.gameId]);

  return (
    <div>
      <div className="grid h-screen place-items-center">
        <p>The game has started!</p>
        <div className="divider divider-horizontal" />
        <p>Build your amazing game from here! :)</p>

        <ul className="menu bg-base-200 w-100 p-2 rounded-box">
          <p className="p-3">Here&apos;s some debug data if you want it:</p>
          <li>
            <a>GameId: {player.gameId}</a>
          </li>
          <li>
            <a>Username: {player.username}</a>
          </li>
          <li>
            <a>Game State: {gameState}</a>
          </li>
          <li>
            <a>Valid Database ref: {game ? "Yes" : "No"}</a>
          </li>
          <li>
            <a>Scores: {JSON.stringify(scores)}</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
