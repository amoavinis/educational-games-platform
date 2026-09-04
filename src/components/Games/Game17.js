import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game17Sentences } from "../Data/Game17Data";
import useAudio from "../../hooks/useAudio";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

const Game17 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const sentences = useMemo(() => game17Sentences, []);
  const currentItem = sentences[currentIndex];

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef]);

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: sentences.filter((s) => !s.isExample).length,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [gameStats.totalRounds, sentences]);

  // Παίζει το μήνυμα λήξης της εξάσκησης, πριν ξεκινήσουν τα βαθμολογούμενα ερεθίσματα
  const playPracticeEnd = () => {
    setWaitingForPracticeEnd(true);
    setTimeout(() => {
      practiceEndAudioRef.current.play().catch((error) => {
        console.error("Error playing end of practice audio:", error);
        setWaitingForPracticeEnd(false);
      });
    }, 100);
  };

  const resetSentence = () => {
    setSelectedText("");
    setFeedback(null);
    setHighlightedText("");
    setHighlightPosition({ start: -1, end: -1 });
  };

  const submitAnswer = () => {
    if (!selectedText) return;

    const isCorrect = selectedText === currentItem.target;

    setFeedback({
      isCorrect,
      targetPart: currentItem.target,
      selectedText,
    });

    // If answer is wrong, highlight the correct word instead
    if (!isCorrect) {
      const correctIndex = currentItem.sentence.indexOf(currentItem.target);
      setHighlightedText(currentItem.target);
      setHighlightPosition({
        start: correctIndex,
        end: correctIndex + currentItem.target.length,
      });
    }

    // Update game stats only for non-example questions
    if (!currentItem.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: currentItem.sentence,
            target: currentItem.target,
            result: selectedText,
            isCorrect: isCorrect,
            seconds: secondsForQuestion,
          },
        ],
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      }));
    }

    // After the last example, signal that the practice phase is over
    if (currentItem.isExample && !sentences[currentIndex + 1]?.isExample) {
      playPracticeEnd();
    }
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetSentence();
      setQuestionStartTime(Date.now());
    } else {
      setGameCompleted(true);
      submitGameResults({ gameStats });
    }
  };

  // Submit game results function
  const submitGameResults = async (gameData) => {
    if (!studentId || !classId) {
      console.error("Missing required data for report submission");
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
      datetime: datetime,
      gameName: "SentenceWordHighlightGame",
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
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleTextSelection = () => {
    // Prevent selection if feedback has already been given
    if (feedback) return;

    const selection = window.getSelection();
    if (selection.toString() && selection.rangeCount > 0) {
      // Το διπλό κλικ συχνά πιάνει και το κενό μετά τη λέξη
      const cleaned = selection.toString().trim();
      const sentence = currentItem.sentence;
      const targetIndex = sentence.indexOf(cleaned);

      if (cleaned && targetIndex !== -1) {
        setSelectedText(cleaned);
        setHighlightedText(cleaned);
        setHighlightPosition({
          start: targetIndex,
          end: targetIndex + cleaned.length,
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
            backgroundColor: "#28a745",
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

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameCompleted) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted]);

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered">
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
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!currentItem.isExample && (
            <QuestionProgressLights
              totalQuestions={sentences.filter((s) => !s.isExample).length}
              currentQuestion={sentences.slice(0, currentIndex).filter((s) => !s.isExample).length}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
          )}
          {currentItem.isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Διαβάζω την πρόταση και επιλέγω τη λέξη που ταιριάζει</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="p-3 bg-light rounded mb-4">
                <div className="fs-3 fst-italic text-secondary">«{currentItem.definition}»</div>
              </div>

              <div
                className="display-6 font-weight-bold mb-2 p-4"
                style={{
                  cursor: feedback ? "default" : "pointer",
                  userSelect: feedback ? "none" : "text",
                }}
                onMouseUp={handleTextSelection}
              >
                {highlightedText ? highlightText(currentItem.sentence, highlightedText, highlightPosition) : currentItem.sentence}
              </div>

              {feedback && (
                <div className="text-center">
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

          {/* Next Sentence Button (only show after feedback) */}
          {feedback && (
            <div className="text-center mt-4">
              <Button variant="primary" size="lg" onClick={nextSentence} disabled={waitingForPracticeEnd}>
                {currentIndex < sentences.length - 1 ? "Επόμενη Πρόταση" : "Ολοκλήρωση"}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Game17;
