import React, { useState } from "react";
import { Button, Card, Container, ProgressBar, Alert } from "react-bootstrap";
import "../../styles/Game.css";

const WordSeparationGame = ({ reportFn }) => {
  // Sample phrases (2-word combinations)
  const phrases = [
    { combined: "SUNFLOWER", correctSplit: ["SUN", "FLOWER"] },
    { combined: "NOTEBOOK", correctSplit: ["NOTE", "BOOK"] },
    { combined: "BASEBALL", correctSplit: ["BASE", "BALL"] },
    { combined: "BIRDHOUSE", correctSplit: ["BIRD", "HOUSE"] },
    { combined: "RAINCOAT", correctSplit: ["RAIN", "COAT"] },
  ];

  const [gameState, setGameState] = useState("playing");
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [gameData, setGameData] = useState({
    rounds: [],
    totalCorrect: 0,
    totalRounds: phrases.length,
  });

  const currentPhrase = phrases[currentRound];

  // Handle letter click
  const handleLetterClick = (position) => {
    setSelectedPosition(position === selectedPosition ? null : position);
  };

  // Handle submission
  const handleSubmit = () => {
    if (selectedPosition === null) return;

    const isCorrect =
      selectedPosition === currentPhrase.correctSplit[0].length - 1;

    setGameData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          phrase: currentPhrase.combined,
          selectedSplit: [
            currentPhrase.combined.slice(0, selectedPosition + 1),
            currentPhrase.combined.slice(selectedPosition + 1),
          ],
          correctSplit: currentPhrase.correctSplit,
          correct: isCorrect,
        },
      ],
      totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalTotal,
    }));

    // Move to next phrase or end game
    if (currentRound < phrases.length - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedPosition(null);
    } else {
      setGameState("completed");
      reportFn({
        ...gameData,
        totalCorrect: isCorrect
          ? gameData.totalCorrect + 1
          : gameData.totalCorrect,
      });
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState("playing");
    setCurrentRound(0);
    setSelectedPosition(null);
    setGameData({
      rounds: [],
      totalCorrect: 0,
      totalRounds: phrases.length,
    });
  };

  // Render current phrase with clickable letters
  const renderPhrase = () => {
    return (
      <div className="phrase-container mb-4">
        {currentPhrase.combined.split("").map((letter, index) => (
          <React.Fragment key={index}>
            <div className="letter">
              <span>{letter}</span>
            </div>
            {index < currentPhrase.combined.length - 1 && (
              <span
                className={`space ${
                  selectedPosition === index ? "selected-space" : ""
                }`}
                onClick={() => handleLetterClick(index)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Game screen
  if (gameState !== "completed") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Separate the Words</h2>

        <ProgressBar
          now={(currentRound / phrases.length) * 100}
          label={`${currentRound}/${phrases.length}`}
          className="w-100 mb-4"
        />

        <Alert variant="info" className="mb-4">
          Click between the letters where the words should be separated
        </Alert>

        {renderPhrase()}

        <div className="d-flex gap-3">
          <Button
            variant="primary"
            onClick={() => setSelectedPosition(null)}
            disabled={selectedPosition === null}
          >
            Clear
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={selectedPosition === null}
          >
            Submit
          </Button>
        </div>
      </Container>
    );
  }

  // Results screen
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      <Card className="w-100">
        <Card.Header as="h3">Game Results</Card.Header>
        <Card.Body>
          <p className="h4 text-center mb-4">
            Score: {gameData.totalCorrect} / {gameData.totalRounds}
          </p>

          <div className="mb-4">
            <h5>Phrase Results:</h5>
            <ul className="list-group">
              {gameData.rounds.map((round, index) => (
                <li key={index} className="list-group-item">
                  <div>
                    Phrase: <strong>{round.phrase}</strong>
                  </div>
                  <div>
                    You selected:{" "}
                    <strong
                      className={round.correct ? "text-success" : "text-danger"}
                    >
                      {round.selectedSplit[0]} | {round.selectedSplit[1]}
                    </strong>
                  </div>
                  {!round.correct && (
                    <div>
                      Correct answer:{" "}
                      <strong className="text-success">
                        {round.correctSplit[0]} | {round.correctSplit[1]}
                      </strong>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" href="/">
              Back to Home
            </Button>
            <Button variant="primary" onClick={resetGame}>
              Play Again
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WordSeparationGame;
