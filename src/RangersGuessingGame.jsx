import React, { useEffect, useState } from "react";

const GRID_SIZE = 4;

const players = [
  "Ally McCoist",
  "Brian Laudrup",
  "Paul Gascoigne",
  "Barry Ferguson",
  "James Tavernier"
];

const difficulties = {
  easy: 10,
  medium: 7,
  hard: 5
};

const DailyChallengeSeed = new Date().toISOString().split("T")[0];

function RangersGuessingGame() {
  const [tiles, setTiles] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [clues, setClues] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    const randomPlayer = players[
      Math.abs(DailyChallengeSeed.split("-").join("").split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
        players.length
    ];
    await loadPlayer(randomPlayer);
  };

  const loadPlayer = async (name) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts|pageimages&titles=${encodeURIComponent(
          name
        )}&exintro&explaintext&pithumbsize=600`
      );
      const data = await response.json();
      const pages = data.query.pages;
      const page = pages[Object.keys(pages)[0]];
      setPlayerName(name);
      setImageURL(page.thumbnail?.source || "");
      const factText = page.extract;
      setClues(generateClues(factText));
      setTiles(generateGrid());
      setRevealed([Math.floor(Math.random() * 16)]);
      setStartTime(Date.now());
    } catch (err) {
      console.error(err);
    }
  };

  const generateGrid = () => new Array(GRID_SIZE * GRID_SIZE).fill(false);

  const generateClues = (text) => {
    const sentences = text.split(".").filter((s) => s.length > 20);
    return sentences.slice(0, difficulties[difficulty]);
  };

  const revealNextTile = () => {
    const unrevealed = tiles.map((_, i) => i).filter((i) => !revealed.includes(i));
    const next = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setRevealed([...revealed, next]);
  };

  const handleClueAnswer = (correct) => {
    if (correct) {
      revealNextTile();
      setScore(score + 1);
    } else {
      setScore(score - 1);
    }
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === playerName.toLowerCase()) {
      setGameOver(true);
      setScore(score + 5);
    } else {
      setScore(score - 2);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Rangers Guessing Game (Daily Challenge)</h1>
      <div className="flex gap-2 mb-2">
        <label>Difficulty: </label>
        <select onChange={(e) => setDifficulty(e.target.value)} value={difficulty}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-4">
        {new Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-gray-700"
            style={{
              backgroundImage: revealed.includes(i) ? `url(${imageURL})` : "none",
              backgroundSize: "320px 320px",
              backgroundPosition: `${-(i % 4) * 80}px ${-Math.floor(i / 4) * 80}px`
            }}
          />
        ))}
      </div>

      <div className="mb-4">
        {clues.map((clue, index) => (
          <div key={index} className="mb-2 border p-2 bg-white">
            <p>{clue}</p>
            <button onClick={() => handleClueAnswer(true)} className="bg-blue-500 text-white px-3 py-1 mt-2">Reveal Tile</button>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Guess the player"
        />
        <button onClick={handleGuess} className="bg-green-500 text-white px-3 py-1">Guess</button>
      </div>

      {gameOver && (
        <div className="p-4 bg-green-100 rounded">
          <p>🎉 Correct! You scored {score} points in {(Date.now() - startTime) / 1000}s</p>
          <p>Player: {playerName}</p>
        </div>
      )}

      <div className="text-sm mt-4">
        <p>Images and facts from Wikipedia under CC BY-SA 4.0.</p>
      </div>
    </div>
  );
}

export default RangersGuessingGame;
