import React, { useState, useEffect } from "react";
import { Button, Card, Modal, Container, ProgressBar } from "react-bootstrap";
import "../../styles/Game.css";

const PrefixSuffixHighlightGame = () => {
  const words = [
    { word: 'καταστρέφω', prefix: 'κατα', stem: 'στρεφ', suffix: 'ω', task: 'prefix' },
    { word: 'επιχρωματισμένος', prefix: 'επι', stem: 'χρωματισμεν', suffix: 'ος', task: 'suffix' },
    { word: 'επιλέγω', prefix: 'επι', stem: 'λεγ', suffix: 'ω', task: 'prefix' },
    { word: 'δυσλεξικός', prefix: 'δυσ', stem: 'λεξικ', suffix: 'ός', task: 'suffix' }
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
    totalRounds: words.length,
  });

  // Current word data
  const currentWord = words[currentRound];
  const targetPart = currentWord.task === 'prefix' ? currentWord.prefix : currentWord.suffix;

  // Check selection
  const checkSelection = () => {
    const correct = selectedText === targetPart;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update game data
    setGameData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          word: currentWord.word,
          target: targetPart,
          selected: selectedText,
          correct: correct,
          task: currentWord.task,
        },
      ],
      totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
    }));
  };

  // Move to next round
  const nextRound = () => {
    setSelectedText("");
    setShowFeedback(false);

    if (currentRound < words.length - 1) {
      setCurrentRound(currentRound + 1);
    } else {
      setGameCompleted(true);
      /* reportFn(gameData); */
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
      totalRounds: words.length,
    });
  };

  // Text selection handler
  useEffect(() => {
    const handleSelection = () => {
      if (!showFeedback) {
        const selection = window.getSelection();
        const selected = selection.toString().toLowerCase();
        if (selected) {
          setSelectedText(selected);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [showFeedback]);

  // Render task-specific styles
  const getTaskColor = () => {
    return currentWord.task === 'prefix' ? 'primary' : 'warning';
  };

  const getTaskTitle = () => {
    return currentWord.task === 'prefix' 
      ? 'Επιλέξτε το ΠΡΟΘΗΜΑ της λέξης' 
      : 'Επιλέξτε το ΕΠΙΘΗΜΑ της λέξης';
  };

  // Render game screen
  if (!gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Χρωματισμός Προθημάτων & Επιθημάτων</h2>

        <ProgressBar
          now={(currentRound / words.length) * 100}
          label={`${currentRound + 1}/${words.length}`}
          className="w-100 mb-4"
        />

        <div className="mb-4 text-center">
          <h4 className={`text-${getTaskColor()}`}>
            {getTaskTitle()}
          </h4>
        </div>

        <div 
          className="mb-4 display-4 font-weight-bold" 
          style={{ userSelect: "text", cursor: "pointer" }}
        >
          {currentWord.word}
        </div>

        <div className="mb-4">
          <p>
            Επιλέξατε: <strong>{selectedText || "—"}</strong>
          </p>
        </div>

        <Button
          variant={getTaskColor()}
          onClick={checkSelection}
          disabled={!selectedText}
          className="mb-3"
        >
          Υποβολή
        </Button>

        <Button
          variant="outline-secondary"
          onClick={() => setSelectedText("")}
          disabled={!selectedText}
        >
          Επαναφορά
        </Button>

        {/* Feedback Modal */}
        <Modal show={showFeedback} onHide={nextRound}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isCorrect ? "Σωστά!" : "Λάθος"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isCorrect ? (
              <p>
                Επιλέξατε σωστά το <strong>{targetPart}</strong>!
              </p>
            ) : (
              <p>
                Επιλέξατε: <strong className="text-danger">{selectedText || "τίποτα"}</strong><br />
                Η σωστή απάντηση ήταν: <strong className="text-success">{targetPart}</strong>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant={isCorrect ? "success" : "primary"} onClick={nextRound}>
              {currentRound < words.length - 1 ? 'Επόμενη Λέξη' : 'Τέλος'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

  // Render results screen
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      <Card className="w-100" style={{ maxWidth: "600px" }}>
        <Card.Header as="h3">Αποτελέσματα</Card.Header>
        <Card.Body>
          <p className="h4 text-center mb-4">
            Βαθμολογία: {gameData.totalCorrect} / {gameData.totalRounds}
          </p>

          <div className="mb-4">
            <h5>Λεπτομέρειες:</h5>
            <ul className="list-group">
              {gameData.rounds.map((round, index) => (
                <li 
                  key={index} 
                  className={`list-group-item ${round.correct ? 'list-group-item-success' : 'list-group-item-danger'}`}
                >
                  <div>
                    <strong>Λέξη:</strong> {round.word}
                  </div>
                  <div>
                    <strong>Ζητούμενο:</strong> {round.task === 'prefix' ? 'Πρόθημα' : 'Επίθημα'} ({round.target})
                  </div>
                  <div>
                    <strong>Επιλογή σας:</strong> {round.selected}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" href="/">
              Αρχική Σελίδα
            </Button>
            <Button variant="primary" onClick={resetGame}>
              Παίξτε Ξανά
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PrefixSuffixHighlightGame;