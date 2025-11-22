// Game 10
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game10Words } from "../Data/Game10";

const SyllableReadingGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game10Words, []);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightStage, setHighlightStage] = useState("none"); // 'none', 'prefix', 'stem', 'suffix', 'full'
  const [isSlowPhase, setIsSlowPhase] = useState(true);
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
        totalRounds: words.filter((w) => !w.isExample).length,
      }));
    }
  }, [gameStats.totalRounds, words]);

  // Submit game results function
  const submitGameResults = useCallback(async () => {
    if (!studentId || !classId) {
      console.error("Missing studentId or classId, cannot submit results");
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
      audioDownloadURL: audioDownloadURL,
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
      mediaRecorderRef.current = null; // Clear the mediaRecorder reference
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

        // Store the audio blob for upload when game completes
        if (audioBlob.size > 0) {
          try {
            const uploadResult = await uploadAudioRecording(audioBlob, {
              studentId,
            });
            setAudioDownloadURL(uploadResult.downloadURL);
          } catch (error) {
            console.error("Error uploading audio:", error);
          }
        } else {
          console.warn("Audio blob is empty, skipping upload");
        }
      };

      mediaRecorderRef.current = recorder;
      // Start recording with time slice to ensure ondataavailable is called
      recorder.start(1000); // Request data every 1000ms
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone permission denied or not available");
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
    // Immediately set to "prefix" highlight to avoid black text delay
    setHighlightStage("prefix");
    const duration = slowPhase ? 1000 : 500;

    setTimeout(() => {
      setHighlightStage("stem");
      setTimeout(() => {
        setHighlightStage("suffix");
        setTimeout(() => {
          setHighlightStage("full");
          const fullDuration = 10000;
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
      // Immediately set to prefix highlight to avoid black text during transitions
      setHighlightStage("prefix");
      setTimeout(() => startWordHighlighting(nextIndex, currentSlowPhase), 100);
    } else if (currentSlowPhase) {
      // Switch to fast phase - skip example word in second round
      setIsSlowPhase(false);
      setCurrentWordIndex(1); // Start from index 1 (skip example at index 0)
      setHighlightStage("prefix");
      setTimeout(() => startWordHighlighting(1, false), 100);
    } else {
      // Game completed
      setGameCompleted(true);
      // Stop recording after a slight delay to ensure proper cleanup
      setTimeout(() => {
        stopRecording();
      }, 100);
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
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h4 className="mb-0">Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ.</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <p className="lead">Πάτησε Έναρξη και διάβασε τις συλλαβές και τις λέξεις.</p>
                </div>
                <Button variant="success" size="lg" onClick={startGame} className="mb-4">
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

  // Game screen
  if (!currentWord) {
    return null; // Safety check
  }

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">
                {currentWord.isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ {isSlowPhase ? "(Αργά)" : "(Γρήγορα)"}
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
