import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game3Words } from "../Data/Game3";

const GreekReadingExercise = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game3Words, []);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightStage, setHighlightStage] = useState("none"); // 'none', 'root', 'suffix', 'full'
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [audioDownloadURL, setAudioDownloadURL] = useState(null);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalRounds: 0,
  });
  const [resultsSubmitted, setResultsSubmitted] = useState(false);

  const currentWord = words[currentWordIndex];

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: words.length,
      }));
    }
  }, [gameStats.totalRounds, words]);

  // Submit game results function
  const submitGameResults = useCallback(async () => {
    if (!studentId || !classId) {
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
      gameName: "GreekReadingExercise",
      questions: gameStats.rounds,
      audioDownloadURL: audioDownloadURL,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results)
      });
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  }, [gameStats.rounds, studentId, classId, schoolId, gameId, audioDownloadURL]);

  // Audio recording functions
  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && isRecording) {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      mediaRecorderRef.current = null;
    }
  }, [isRecording]);

  // Submit final results when game completes and audio is available
  useEffect(() => {
    if (gameCompleted && gameStats.rounds.length > 0 && !resultsSubmitted && audioDownloadURL) {
      submitGameResults();
      setResultsSubmitted(true);
    }
  }, [gameCompleted, gameStats.rounds, submitGameResults, resultsSubmitted, audioDownloadURL]);

  // Ensure recording stops when game completes
  useEffect(() => {
    if (gameCompleted && isRecording) {
      stopRecording();
    }
  }, [gameCompleted, isRecording, stopRecording]);

  // Cleanup recording on component unmount (back button, navigation, etc.)
  useEffect(() => {
    return () => {
      // Cleanup function called when component unmounts
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && isRecording) {
        // Just stop the recording and clean up streams, don't trigger upload
        if (mediaRecorder.state === "recording") {
          // Remove event handlers to prevent onstop from firing
          mediaRecorder.onstop = null;
          mediaRecorder.stop();
        }
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  // Audio recording setup
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (recorder.state !== "inactive") {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        if (audioBlob.size > 0) {
          try {
            const uploadResult = await uploadAudioRecording(audioBlob, {
              studentId,
            });
            setAudioDownloadURL(uploadResult.downloadURL);
          } catch (error) {
            console.error("Error uploading audio:", error);
          }
        }
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone permission denied or not available");
    }
  };

  // Start game
  const startGame = async () => {
    await startRecording();
    setGameStarted(true);
    startWordHighlighting(0, true); // Start with first word in first round
  };

  // Start highlighting sequence for current word (only in first round)
  const startWordHighlighting = (wordIndex, firstRound) => {
    if (firstRound) {
      // Ensure root highlight is set (may already be set from nextWord)
      setHighlightStage("root");
      const duration = 1000;

      setTimeout(() => {
        setHighlightStage("suffix");
        setTimeout(() => {
          setHighlightStage("full");
          setTimeout(() => {
            nextWord(wordIndex, firstRound);
          }, 2000); // Full highlight duration
        }, duration);
      }, duration);
    } else {
      // Second round - no highlighting, just show word for 2 seconds
      setHighlightStage("none");
      setTimeout(() => {
        nextWord(wordIndex, firstRound);
      }, 2000);
    }
  };

  // Move to next word
  const nextWord = (currentIndex, currentFirstRound) => {
    // Record result for all words
    const wordToRecord = words[currentIndex];
    if (wordToRecord) {
      const round = currentFirstRound ? "πρώτος" : "δεύτερος";
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
      // For first round, immediately set to root highlight to avoid black text
      if (currentFirstRound) {
        setHighlightStage("root");
        setTimeout(() => startWordHighlighting(nextIndex, currentFirstRound), 100);
      } else {
        setHighlightStage("none");
        setTimeout(() => startWordHighlighting(nextIndex, currentFirstRound), 500);
      }
    } else if (currentFirstRound) {
      // Switch to second round
      setIsFirstRound(false);
      setCurrentWordIndex(0);
      setHighlightStage("none");
      setTimeout(() => startWordHighlighting(0, false), 500);
    } else {
      // Game completed
      setGameCompleted(true);
      setTimeout(() => {
        stopRecording();
      }, 100);
    }
  };

  // Function to highlight text parts (only for first round)
  const highlightWord = () => {
    if (!currentWord) return "";

    const { word, root } = currentWord;

    if (!isFirstRound || highlightStage === "none") {
      return word;
    }

    // Find positions
    const rootEnd = root.length;

    let result = [];

    // Root highlighting
    if (highlightStage === "root" || highlightStage === "full") {
      result.push(
        <span key="root" style={{ color: "blue" }}>
          {word.substring(0, rootEnd)}
        </span>
      );
    } else {
      result.push(word.substring(0, rootEnd));
    }

    // Suffix highlighting
    if (highlightStage === "suffix" || highlightStage === "full") {
      result.push(
        <span key="suffix" style={{ color: "green" }}>
          {word.substring(rootEnd)}
        </span>
      );
    } else {
      result.push(word.substring(rootEnd));
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
                <h4 className="mb-0">Άσκηση Ανάγνωσης</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <p className="lead">
                    Πάτησε Έναρξη και διάβασε τις λέξεις με προσοχή.
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
            <Card.Header className="text-center bg-primary text-white">
              <h4 className="mb-0">
                Άσκηση Ανάγνωσης - {isFirstRound ? "Πρώτος" : "Δεύτερος"} Γύρος
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

export default GreekReadingExercise;