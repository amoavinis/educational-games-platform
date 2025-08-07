import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
// import { uploadAudioRecording } from "../../services/audioStorage";
import { game10Words } from "../Data/Game10";

const SyllableReadingGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game10Words, []);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightStage, setHighlightStage] = useState("none"); // 'none', 'prefix', 'stem', 'suffix', 'full'
  const [isSlowPhase, setIsSlowPhase] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalRounds: 0,
  });

  const currentWord = words[currentWordIndex];

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: words.filter((w) => !w.isExample).length,
      }));
    }
  }, [gameStats.totalRounds, words]);

  // Submit game results function
  const submitGameResults = useCallback(async () => {
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
      gameName: "SyllableReadingGame",
      questions: gameStats.rounds,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results)
      });
      // console.log("Game results submitted successfully");
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  }, [gameStats.rounds, studentId, classId, schoolId, gameId]);

  // Submit final results when game completes
  useEffect(() => {
    if (gameCompleted && gameStats.rounds.length > 0) {
      submitGameResults();
    }
  }, [gameCompleted, gameStats.rounds, submitGameResults]);

  // Audio recording setup
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.log("Microphone permission denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  // Start game
  const startGame = async () => {
    await startRecording();
    setGameStarted(true);
    startWordHighlighting(0, true); // Start with first word in slow phase
  };

  // Start highlighting sequence for current word
  const startWordHighlighting = (wordIndex, slowPhase) => {
    setHighlightStage("prefix");
    const duration = slowPhase ? 1000 : 500;

    setTimeout(() => {
      setHighlightStage("stem");
      setTimeout(() => {
        setHighlightStage("suffix");
        setTimeout(() => {
          setHighlightStage("full");
          const fullDuration = slowPhase ? 2000 : 1500;
          setTimeout(() => {
            nextWord(wordIndex, slowPhase);
          }, fullDuration);
        }, duration);
      }, duration);
    }, duration);
  };

  // Move to next word
  const nextWord = (currentIndex, currentSlowPhase) => {
    // Record result for non-example words (use current word before updating index)
    const wordToRecord = words[currentIndex];
    if (wordToRecord && !wordToRecord.isExample) {
      const round = currentSlowPhase ? "slow" : "fast";
      // console.log('Recording word:', wordToRecord.word, 'phase:', round);
      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: `${wordToRecord.word} (${round})`,
          },
        ],
      }));
    }

    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentWordIndex(nextIndex);
      setHighlightStage("none");
      setTimeout(() => startWordHighlighting(nextIndex, currentSlowPhase), 500);
    } else if (currentSlowPhase) {
      // Switch to fast phase - skip example word in second round
      setIsSlowPhase(false);
      setCurrentWordIndex(1); // Start from index 1 (skip example at index 0)
      setHighlightStage("none");
      setTimeout(() => startWordHighlighting(1, false), 500);
    } else {
      // Game completed
      stopRecording();
      setGameCompleted(true);
    }
  };

  // Function to highlight text parts
  const highlightWord = () => {
    if (!currentWord) return "";

    const { word, prefix, stem } = currentWord;

    if (highlightStage === "none") {
      return word;
    }

    // Find positions
    const prefixEnd = prefix.length;
    const stemEnd = prefixEnd + stem.length;

    let result = [];

    // Prefix highlighting
    if (highlightStage === "prefix" || highlightStage === "full") {
      result.push(
        <span key="prefix" style={{ color: "blue" }}>
          {word.substring(0, prefixEnd)}
        </span>
      );
    } else {
      result.push(word.substring(0, prefixEnd));
    }

    // Stem highlighting
    if (highlightStage === "stem" || highlightStage === "full") {
      result.push(
        <span key="stem" style={{ color: "red" }}>
          {word.substring(prefixEnd, stemEnd)}
        </span>
      );
    } else {
      result.push(word.substring(prefixEnd, stemEnd));
    }

    // Suffix highlighting
    if (highlightStage === "suffix" || highlightStage === "full") {
      result.push(
        <span key="suffix" style={{ color: "green" }}>
          {word.substring(stemEnd)}
        </span>
      );
    } else {
      result.push(word.substring(stemEnd));
    }

    return result;
  };

  // Start screen
  if (!gameStarted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <Card className="main-card">
              <Card.Header className="text-center bg-primary text-white">
                <h4 className="mb-0">Προθήματα και Επιθήματα</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <p className="lead">
                    Πάτησε Έναρξη και διάβασε τις συλλαβές και τις λέξεις.
                  </p>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={startGame}
                  className="mb-4"
                >
                  Έναρξη
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Game completed screen
  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <Card className="main-card">
              <Card.Header className="text-center bg-success text-white">
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="mt-4"
                >
                  Τέλος Άσκησης
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Game screen
  if (!currentWord) {
    return null; // Safety check
  }

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <Card className="main-card">
            <Card.Header
              className={`text-center ${
                currentWord.isExample
                  ? "bg-warning text-dark"
                  : "bg-primary text-white"
              }`}
            >
              <h4 className="mb-0">
                {currentWord.isExample && (
                  <span className="badge badge-dark me-2">Παράδειγμα</span>
                )}
                Προθήματα και Επιθήματα {isSlowPhase ? "(Αργά)" : "(Γρήγορα)"}
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div
                className="display-4 font-weight-bold mb-4 p-4"
                style={{
                  minHeight: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {highlightWord()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SyllableReadingGame;
