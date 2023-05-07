import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchGame,
  windowClose,
  checkGameExists,
  createGame,
} from "../../libs/gameLib";
import {
  hostGame,
  updateState,
  readGameState,
  readScores,
} from "../../libs/highLevelGameLib";
import { BsFillPersonFill } from "react-icons/bs";
import { get, onValue } from "firebase/database";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import HostPlayerBubble from "../../components/HostPlayer";
import { useRouter } from "next/router";
import Winner from "../../components/winner";

export const getServerSideProps = async (context) => {
  const hostName = context.query.hostName || "";

  // Generate a random 6 digit number
  const gameId = Math.floor(100000 + Math.random() * 900000);

  // Check if game Id already exists
  const exists = await checkGameExists(gameId);

  // If game Id exists, generate a new one
  while (exists) {
    const newGameId = Math.floor(100000 + Math.random() * 900000);
    exists = await checkGameExists(newGameId);
  }

  // the game with the new game Id
  await createGame(gameId);

  console.log(gameId);

  return {
    props: {
      gameId: gameId.toString(),
      hostName,
    },
  };
};

export default function HostWaiting({ gameId }) {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(100 * 60 * 1000); // 10 minutes in milliseconds
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerScore, setWinnerScore] = useState(null);
  const [formattedTimeRemaining, setFormattedTimeRemaining] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (gameId !== undefined) {
      const gameRef = fetchGame(gameId);
      setGame(gameRef);
    }
  }, [gameId]);

  useEffect(() => {
    console.log("Game: " + game);
    if (game) {
      onValue(game, (snapshot) => {
        if (snapshot.val()) {
          const data = snapshot.val().players;

          console.log(data);

          setPlayers(data);
        }
      });
    }
  }, [game]);

  useEffect(() => {
    const fetchScores = async () => {
      const state = await readGameState(gameId);
      setGameState(state);
      if (game && state === "playing") {
        const intervalId = setInterval(async () => {
          const scorePromises = players.map((player) =>
            readScores(gameId, player)
          );
          const scores = await Promise.all(scorePromises);
          const playerScores = players.map((player, index) => ({
            playerName: player,
            score: scores[index],
          }));
          const sortedScores = playerScores.sort((a, b) => b.score - a.score);
          setScores(sortedScores);
        }, 5000);
        return () => clearInterval(intervalId);
      }
    };
    fetchScores();
  }, [game, players, gameId]);

  useEffect(() => {
    if (gameState === "playing") {
      const timerId = setTimeout(() => {
        setTimeRemaining(0);
        updateState(gameId, "finished");
        setShowWinner(true);
      }, timeRemaining);
      return () => clearTimeout(timerId);
    }
  }, [gameState, timeRemaining, gameId]);

  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    setFormattedTimeRemaining(`${formattedMinutes}:${formattedSeconds}`);
  }, [timeRemaining]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTimeRemaining) => prevTimeRemaining - 1000);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStartClick = () => {
    console.log(`Start button clicked for game ${gameId}`);
    updateState(gameId, "playing");
    setTimeRemaining(5 * 60 * 1000);
  };

  const handleWinnerClose = async () => {
      console.log("handleWinnerClose called");
      if (!game) return;
      setShowWinner(false);
      const scorePromises = players.map((player) => readScores(gameId, player));
      const scores = await Promise.all(scorePromises);
      const playerScores = players.map((player, index) => ({
        playerName: player,
        score: scores[index],
      }));
      const sortedScores = playerScores.sort((a, b) => b.score - a.score);
      const highestScore = sortedScores[0].score;
      const winners = sortedScores.filter((player) => player.score === highestScore);
      const winnerNames = winners.map((winner) => winner.playerName);
      setWinner(winnerNames.join(", "));
      setWinnerScore(highestScore); // Set the winner's score
      setShowWinner(true); // Show the winner
    setTimeout(() => {
      router.push("/");
    }, (5 * 60 * 1000));
  };
  
  

  return (
    <div>
      {/* Game Bar */}

      <div className="navbar bg-base-200">
        <div className="navbar-start">
          <p className="text-2xl">
            Go to <b>example.com/play</b> and enter the Game ID
          </p>
        </div>

        <div className="navbar-center">
          <a
            className="btn btn-normal-case text-5xl"
            onClick={() => {
              navigator.clipboard.writeText(gameId);
              toast.success("Copied to clipboard!");
            }}>
            {gameId}
          </a>
        </div>
        <div className="navbar-end"></div>
      </div>

      {/* Start Button */}
      <div className="flex flex-row items-center justify-center w-90 m-3">
        <div className="w-14 h-5 text-center flex flex-row justify-center items-center gap-x-3">
          <p className="text-2xl font-bold">{players ? players.length : 0}</p>
          <BsFillPersonFill className="text-5xl" />
        </div>

        {game && gameState === "waiting" && (
          <p className="text-5xl font-bold ml-4">Jeopardy</p>
        )}

        {game && gameState === "playing" && (
          <p className="text-5xl font-bold ml-4">{formattedTimeRemaining}</p>
        )}

        {game && gameState === "waiting" && (
          <button className="btn btn-primary ml-4" onClick={handleStartClick}>
            Start
          </button>
        )}
      </div>

      {game && gameState === "waiting" && (
        <div className="grid grid-cols-8 p-12">
          {players?.map((player) => (
            <HostPlayerBubble
              player={player}
              pageType="hostWaiting"
              key={player}
            />
          ))}
        </div>
      )}

      {game && gameState === "playing" && (
        <div className="grid grid-cols-8 p-12">
          {scores?.map((player) => (
            <HostPlayerBubble
              player={player.playerName}
              score={player.score}
              pageType="hostPlaying"
              key={player.playerName}
            />
          ))}
        </div>
      )}

      {handleWinnerClose && showWinner && (
        <Winner
          winner={winner}
          score={winnerScore}
        />
      )}
    </div>
  );
}
