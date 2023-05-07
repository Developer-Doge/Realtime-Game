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

    const fetchData = async () => {
      const categories = await getRandomCategories(NUM_CATEGORIES);
      const cluePromises = categories.map(({ id }) =>
        getCategoryClues(id, NUM_CLUES_PER_CATEGORY)
      );
      const clues = await Promise.all(cluePromises);
      setCategories(categories);
      setClues(clues);
    };
    fetchData();
    return () => {
      readScores(player.gameId, player.username, false);
    };
  }, [game, player.gameId]);

  const renderCategories = () =>
    categories.map((category, i) => {
      const categoryClues = clues[i]
        .filter(({ value }) => !!value)
        .sort((a, b) => a.value - b.value)
        .slice(0, NUM_CLUES_PER_CATEGORY);
      return (
        <div className="p-2" key={i}>
          <h3 className="text-center text-xl">{category.title}</h3>
          <div className="flex flex-col bg-gray-200">
            {categoryClues.map((clue, j) => (
              <button
                key={j}
                className={`py-2 px-4 flex-1 text-center ${
                  disabledClues.includes(clue.id)
                    ? "bg-gray-400"
                    : "hover:bg-yellow-400"
                }`}
                onClick={() => handleClueClick(clue)}
                disabled={disabledClues.includes(clue.id)}>
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
          <form onSubmit={handleGuessSubmit}>
            <input
              className="border border-gray-400 p-2 w-80"
              type="text"
              placeholder="Your answer"
              value={guess}
              onChange={handleGuessChange}
            />
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
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
          <div className="flex justify-between my-4">
            <div className="p-4 bg-green-400 rounded-lg">
              <h3 className="text-lg font-bold">Correct Guesses</h3>
              <p className="text-4xl font-bold">{correctGuesses}</p>
            </div>
            <div className="p-4 bg-red-400 rounded-lg">
              <h3 className="text-lg font-bold">Incorrect Guesses</h3>
              <p className="text-4xl font-bold">{incorrectGuesses}</p>
            </div>
          </div>
        </>
      )}
      <Link href="/">
        <a className="block text-center text-xl mt-8 underline">Back to Home</a>
      </Link>
    </div>
  );
}
