// Game 2
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game2Words } from "../Data/Game2";

const RootSuffixGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [highlightPosition, setHighlightPosition] = useState({
    start: -1,
    end: -1,
  });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    correctAnswers: 0,
    totalRounds: 0,
  });
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const words = useMemo(() => game2Words, []);

  // Initialize game stats and start time
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: words.filter((w) => !w.isExample).length,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [gameStats.totalRounds, words]);

  const currentWord = words[currentWordIndex];

  const resetWord = () => {
    setSelectedText("");
    setFeedback(null);
    setHighlightedText("");
    setHighlightPosition({ start: -1, end: -1 });
  };

  const submitAnswer = () => {
    if (!selectedText) return;

    const isCorrect = selectedText === currentWord.suffix;

    setFeedback({
      isCorrect,
      targetPart: currentWord.suffix,
      selectedText,
    });

    // If answer is wrong, highlight the correct answer instead
    if (!isCorrect) {
      const word = currentWord.word;
      const suffix = currentWord.suffix;
      const correctIndex = word.lastIndexOf(suffix); // Use lastIndexOf for suffix
      setHighlightedText(suffix);
      setHighlightPosition({
        start: correctIndex,
        end: correctIndex + suffix.length,
      });
    }
    // If correct, keep the user's selection highlighted

    // Update game stats only for non-example questions
    if (!currentWord.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: currentWord.word,
            target: currentWord.suffix,
            result: selectedText,
            isCorrect: isCorrect,
            seconds: secondsForQuestion,
          },
        ],
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      }));
    }
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      resetWord();
      setQuestionStartTime(Date.now());
    } else {
      setGameCompleted(true);
      submitGameResults({ gameStats });
    }
  };

  // Submit game results function
  const submitGameResults = async (gameData) => {
    if (!studentId || !classId) {
      console.log("Missing studentId or classId, cannot submit results");
      return;
    }

    const now = new Date();
    const datetime =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");

    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "RootSuffixGame",
      questions: gameData.gameStats.rounds,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results),
      });
      // console.log("Game results submitted successfully");
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString() && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      const word = currentWord.word;

      // For now, let's use a simpler approach: find ALL occurrences and highlight the selected one
      // We'll store both the text and which occurrence it is
      const occurrences = [];
      let index = 0;
      while ((index = word.indexOf(selectedText, index)) !== -1) {
        occurrences.push(index);
        index++;
      }

      // For simplicity, let's highlight the last occurrence for suffixes
      // This works well for most cases
      const targetIndex = occurrences[occurrences.length - 1];

      if (targetIndex !== -1) {
        setSelectedText(selectedText);
        setHighlightedText(selectedText);
        setHighlightPosition({
          start: targetIndex,
          end: targetIndex + selectedText.length,
        });
        setFeedback(null);
      }

      selection.removeAllRanges();
    }
  };

  const highlightText = (text, highlight, position) => {
    if (!highlight || position.start === -1) return text;

    // Ensure position is within bounds
    const start = Math.max(0, Math.min(position.start, text.length));
    const end = Math.max(start, Math.min(position.end, text.length));

    return (
      <>
        {text.substring(0, start)}
        <span
          style={{
            backgroundColor: "#8e44ad",
            color: "white",
            padding: "2px 4px",
            borderRadius: "3px",
          }}
        >
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={gameStats.totalRounds}
              currentQuestion={gameStats.totalRounds}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
            <Card className="main-card">
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
                  Τέλος Άσκησης
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!currentWord.isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter((w) => !w.isExample).length}
              currentQuestion={currentWordIndex - 1} // Subtract 1 for example question
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className={`text-center`} style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">
                {currentWord.isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                <span style={{ fontSize: 20 }}>Βρες και χρωμάτισε τα επιθήματα των λέξεων</span>
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="display-4 font-weight-bold mb-4 p-4" style={{ cursor: "pointer", userSelect: "text" }} onMouseUp={handleTextSelection}>
                {highlightedText ? highlightText(currentWord.word, highlightedText, highlightPosition) : currentWord.word}
              </div>

              {feedback && (
                <div className="mb-4 text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="fs-1" style={{ color: feedback.isCorrect ? "#28a745" : "#dc3545" }}>
                      {feedback.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          {!feedback && (
            <div className="d-flex gap-3 mt-4 mb-4 justify-content-center">
              <Button variant={selectedText ? "primary" : "secondary"} size="lg" onClick={submitAnswer} disabled={!selectedText || feedback}>
                Υποβολή
              </Button>
            </div>
          )}

          {/* Next Word Button (only show after feedback) */}
          {feedback && (
            <div className="text-center mt-4">
              <Button variant="primary" size="lg" onClick={nextWord}>
                {currentWordIndex < words.length - 1 ? "Επόμενη Λέξη" : "Ολοκλήρωση"}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RootSuffixGame;
