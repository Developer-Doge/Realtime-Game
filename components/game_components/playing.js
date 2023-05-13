import {
  readGameState,
  readScores,
  addScore,
} from "../../libs/highLevelGameLib";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRandomCategories, getCategoryClues } from "../../libs/jeopardyApi";
const NUM_CATEGORIES = 5;
const NUM_CLUES_PER_CATEGORY = 5;

export default function JeopardyGame({ game, player }) {
  const [gameState, setGameState] = useState();
  const [scores, setScores] = useState({});
  const [categories, setCategories] = useState([]);
  const [clues, setClues] = useState([]);
  const [disabledClues, setDisabledClues] = useState([]);
  const [currentClue, setCurrentClue] = useState(null);
  const [guess, setGuess] = useState("");
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    readGameState(player.gameId).then(setGameState);

    async function fetchData() {
      try {
        console.log(player.gameId)
        const categories = await getRandomCategories(NUM_CATEGORIES, player.gameId);
        const cluePromises = categories.map(({ id }) =>
          getCategoryClues(id, NUM_CLUES_PER_CATEGORY)
        );
        const clues = await Promise.all(cluePromises);
        setCategories(categories);
        setClues(clues);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();

    return () => {
      readScores(player.gameId, player.username, false);
    };
  }, [game, player.gameId]);

  const renderCategories = () =>
    categories.map((category, i) => {
      const categoryClues = clues[i]
        .filter(({ value }) => !!value)
        .reduce((acc, clue) => {
          if (!acc.some((existingClue) => existingClue.value === clue.value)) {
            acc.push(clue);
          }
          return acc;
        }, [])
        .sort((a, b) => a.value - b.value)
        .slice(0, 5);
      return (
        <div key={i} className="card shadow-lg mb-6 p-4">
          <h3 className="text-center text-2xl mb-4">{category.title}</h3>
          <div className="flex flex-col space-y-2">
            {categoryClues.map((clue, j) => (
              <button
                key={j}
                className={`btn btn-md ${disabledClues.includes(clue.id)
                  ? "btn-secondary"
                  : "btn-primary hover:bg-yellow-500"
                  }`}
                onClick={() => handleClueClick(clue)}
                disabled={disabledClues.includes(clue.id)}
              >
                ${clue.value}
              </button>
            ))}
          </div>
        </div>
      );
    });

  const handleClueClick = (clue) => {
    setCurrentClue(clue);
  };

  const handleGuessChange = ({ target: { value } }) => {
    setGuess(value);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (guess.toLowerCase() === currentClue.answer.toLowerCase()) {
      setCorrectGuesses(correctGuesses + 1);
      setDisabledClues([...disabledClues, currentClue.id]);
      setCurrentClue(null);
      setGuess("");
      setCategories([...categories]);
      setShowAnswer(false);
      addScore(player.gameId, player.username, currentClue.value);
    } else {
      setIncorrectGuesses(incorrectGuesses + 1);
      setDisabledClues([...disabledClues, currentClue.id]);
      setShowAnswer(true);
      setTimeout(() => {
        setShowAnswer(false);
        setCurrentClue(null);
        setGuess("");
        setCategories([...categories]);
        addScore(player.gameId, player.username, -currentClue.value);
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center my-8">Jeopardy</h1>
      {currentClue ? (
        <div className="text-center">
          <h2 className="text-2xl mb-4">{currentClue.question}</h2>
          <form onSubmit={handleGuessSubmit} className="form-control w-80 mx-auto">
            <input
              className="input input-bordered w-full"
              type="text"
              placeholder="Your answer"
              value={guess}
              onChange={handleGuessChange}
            />
            <button className="btn btn-primary mt-4 w-full">
              Submit
            </button>
          </form>
          {showAnswer && (
            <p className="text-red-500 mt-4">
              Incorrect! The correct answer is: {currentClue.answer}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4 my-4">
            {renderCategories()}
          </div>
          <div className="flex justify-between my-2">
            <div className="panel w-1/2 md:w-1/4 p-2 flex flex-col items-center justify-center bg-primary text-primary-content rounded-lg">
              <h3 className="text-lg font-bold mb-2">Correct Guesses</h3>
              <p className="text-2xl font-bold">{correctGuesses}</p>
            </div>
            <div className="panel w-1/2 md:w-1/4 p-2 flex flex-col items-center justify-center bg-secondary text-secondary-content rounded-lg">
              <h3 className="text-lg font-bold mb-2">Incorrect Guesses</h3>
              <p className="text-2xl font-bold">{incorrectGuesses}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
