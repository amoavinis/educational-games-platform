import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Container, ProgressBar } from "react-bootstrap";
import "../../styles/Game.css";

const WordHighlightGame = ({ reportFn }) => {
  // Sample word list with parts to highlight
  const wordList = [
    { word: "highlight", part: "high" },
    { word: "education", part: "edu" },
    { word: "react", part: "re" },
    { word: "bootstrap", part: "boot" },
    /* { word: "javascript", part: "java" },
    { word: "programming", part: "pro" },
    { word: "component", part: "com" },
    { word: "developer", part: "dev" },
    { word: "interface", part: "int" },
    { word: "application", part: "app" }, */
  ];

  // Game state
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameData, setGameData] = useState({
    rounds: [],
    totalCorrect: 0,
    totalRounds: wordList.length,
  });

  // Get current word and part to highlight
  const currentWord = wordList[currentRound]?.word || "";
  const partToHighlight = wordList[currentRound]?.part || "";

  // Check if selection is correct
  const checkSelection = () => {
    const correct = selectedText === partToHighlight.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update game data
    setGameData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          word: currentWord,
          target: partToHighlight,
          selected: selectedText,
          correct: correct,
          round: currentRound + 1,
        },
      ],
      totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
    }));
  };

  // Move to next round or end game
  const nextRound = () => {
    setSelectedText("");
    setShowFeedback(false);

    if (currentRound < wordList.length - 1) {
      setCurrentRound(currentRound + 1);
    } else {
      setGameCompleted(true);
      reportFn(gameData); // Call the reporting function with final data
    }
  };

  // Reset game
  const resetGame = () => {
    setCurrentRound(0);
    setSelectedText("");
    setShowFeedback(false);
    setIsCorrect(false);
    setGameCompleted(false);
    setGameData({
      rounds: [],
      totalCorrect: 0,
      totalRounds: wordList.length,
    });
  };

  // Add selection event listener
  useEffect(() => {
    // Handle text selection
    const handleSelection = () => {
      if (!showFeedback) {
        const selection = window.getSelection();
        const selectedText = selection.toString().toLowerCase();
        setSelectedText(selectedText);
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [showFeedback]);

  // Render game screen
  if (!gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Highlight the correct part of the word</h2>

        <ProgressBar
          now={(currentRound / wordList.length) * 100}
          label={`${currentRound}/${wordList.length}`}
          className="w-100 mb-4"
        />

        <div className="mb-4" style={{ fontSize: "2rem", userSelect: "text" }}>
          {currentWord}
        </div>

        <div className="mb-4">
          <p>
            Highlight: <strong>{partToHighlight}</strong>
          </p>
          <p>
            Your selection: <strong>{selectedText || "None"}</strong>
          </p>
        </div>

        <Button
          variant="primary"
          onClick={checkSelection}
          disabled={!selectedText}
        >
          Confirm
        </Button>

        {/* Feedback Modal */}
        <Modal show={showFeedback} onHide={nextRound}>
          <Modal.Header closeButton>
            <Modal.Title>{isCorrect ? "Correct!" : "Incorrect"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isCorrect
              ? `You correctly highlighted "${partToHighlight}"!`
              : `The correct part was "${partToHighlight}". You selected "${selectedText}".`}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={nextRound}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

  // Render results screen
  else {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header as="h3">Game Results</Card.Header>
          <Card.Body>
            <p className="h4 text-center mb-4">
              Score: {gameData.totalCorrect} / {gameData.totalRounds}
            </p>

            <div className="mb-4">
              <h5>Round Details:</h5>
              <ul className="list-group">
                {gameData.rounds.map((round, index) => (
                  <li key={index} className="list-group-item">
                    Word: <strong>{round.word}</strong> | Target:{" "}
                    <strong>{round.target}</strong> | Selected:{" "}
                    <strong>{round.selected}</strong> |
                    {round.correct ? (
                      <span className="text-success"> Correct</span>
                    ) : (
                      <span className="text-danger"> Incorrect</span>
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
  }
};

export default WordHighlightGame;
