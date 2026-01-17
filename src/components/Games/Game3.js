// Game 3
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game3Words } from "../Data/Game3Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/03/title-instructions.mp3";

// Import word audio files
import grafioAudio from "../../assets/sounds/03/γραφείο.mp3";
import grafistasAudio from "../../assets/sounds/03/γραφίστας.mp3";
import grafikosAudio from "../../assets/sounds/03/γραφικός.mp3";
import kleidonoAudio from "../../assets/sounds/03/κλειδώνω.mp3";
import kleidomenos from "../../assets/sounds/03/κλειδωμένος.mp3";
import organonoAudio from "../../assets/sounds/03/οργανώνω.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

const Game3 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game3Words, []);

  // Map words to their audio files
  const wordAudioMap = useMemo(
    () => ({
      γραφείο: grafioAudio,
      γραφίστας: grafistasAudio,
      γραφικός: grafikosAudio,
      γραφέας: null,
      γραφίδα: null,
      γραφικότητα: null,
      οργανώνω: organonoAudio,
      οργανωτικός: null,
      οργανωτής: null,
      οργανωμένος: null,
      κλειδώνω: kleidonoAudio,
      κλειδί: null,
      κλειδωμένος: kleidomenos,
      κλείδωση: null,
      σκουπίζω: null,
      σκουπίδι: null,
      σκουπιστός: null,
      σκουπισμένος: null,
      ποτίζω: null,
      πότισμα: null,
      ποτίστρα: null,
      ποτιστήρι: null,
      ξυπνώ: null,
      ξύπνησα: null,
      ξυπνώντας: null,
      ξυπνητήρι: null,
      ξυπνητός: null,
      ξύπνημα: null,
      μαγειρεύω: null,
      μαγειρεμένος: null,
      μαγείρισσα: null,
      μαγειρικός: null,
      μαγειρείο: null,
    }),
    []
  );

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightStage, setHighlightStage] = useState("none"); // 'none', 'root', 'suffix', 'full'
  const [gameCompleted, setGameCompleted] = useState(false);
  const [audioDownloadURL, setAudioDownloadURL] = useState(null);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalRounds: 0,
  });
  const [resultsSubmitted, setResultsSubmitted] = useState(false);
  const [isInitialAudioPlaying, setIsInitialAudioPlaying] = useState(false);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [isWordAudioPlaying, setIsWordAudioPlaying] = useState(false);
  const [hasPlayedWordAudio, setHasPlayedWordAudio] = useState(false);
  const [timeoutEnded, setTimeoutEnded] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const timeoutRef = useRef(null);
  const [playerClickedAudioButton, setPlayerClickedAudioButton] = useState(false);

  const currentWord = words[currentWordIndex];

  // Initial title-instructions audio
  const { audioRef: titleAudioRef } = useAudio(titleInstructionsAudio, {
    playOnMount: false,
  });

  // Word-specific audio
  const { audioRef: wordAudioRef } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // Listen for title audio ended
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      setIsInitialAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef]);

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      setIsWordAudioPlaying(false);
      setHasPlayedWordAudio(true);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef, currentWordAudio]);

  // Check if can proceed (both audio played and timeout ended)
  useEffect(() => {
    if (hasPlayedWordAudio && timeoutEnded) {
      setCanProceed(true);
    }
  }, [hasPlayedWordAudio, timeoutEnded]);

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

  // Play word audio when speaker button clicked
  const playWordAudio = () => {
    if (currentWordAudio && wordAudioRef.current && !isWordAudioPlaying && !hasPlayedWordAudio) {
      setPlayerClickedAudioButton(true);
      setIsWordAudioPlaying(true);
      wordAudioRef.current.play().catch((error) => {
        console.error("Error playing word audio:", error);
        setIsWordAudioPlaying(false);
      });
      // Trigger highlighting animation when audio plays
      performHighlighting();
    }
  };

  // Handle next question button click
  const handleNextQuestion = () => {
    if (canProceed) {
      // Clear the timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      nextWord(currentWordIndex);
    }
  };

  // Start game
  const startGame = async () => {
    await startRecording();
    setGameStarted(true);
    startWordHighlighting(0);
  };

  // Perform highlighting animation
  const performHighlighting = () => {
    const duration = 1200;
    setHighlightStage("root");

    setTimeout(() => {
      setHighlightStage("suffix");
      setTimeout(() => {
        setHighlightStage("full");
        setTimeout(() => {
          setHighlightStage("none"); // Reset to black
        }, 1.5 * duration);
      }, duration);
    }, duration);
  };

  // Start highlighting sequence for current word
  const startWordHighlighting = (wordIndex) => {
    const fullHighlightDuration = 10000;
    const word = words[wordIndex];

    // Set up word audio or clear if none available
    const audioFile = word && wordAudioMap[word.word] ? wordAudioMap[word.word] : null;
    setCurrentWordAudio(audioFile);

    // Reset states for new word
    setIsWordAudioPlaying(false);
    setHasPlayedWordAudio(false);
    setTimeoutEnded(false);
    setCanProceed(false);

    // Show word in black initially
    setHighlightStage("none");

    // Trigger highlighting animation when word first appears
    setTimeout(() => {
      performHighlighting();
    }, 100);

    // Start the timeout timer
    timeoutRef.current = setTimeout(() => {
      setTimeoutEnded(true);
      // Trigger highlighting animation when timeout ends
      performHighlighting();

      // Only play audio when timeout ends if audio exists for this word
      if (audioFile && wordAudioRef.current) {
        setIsWordAudioPlaying(true);
        wordAudioRef.current.play().catch((error) => {
          console.error("Error playing word audio:", error);
          setIsWordAudioPlaying(false);
          // If play fails, still enable the button
          setHasPlayedWordAudio(true);
        });
      } else {
        // No audio for this word, mark as played so button can be enabled
        setHasPlayedWordAudio(true);
      }
    }, fullHighlightDuration);
  };

  // Move to next word
  const nextWord = (currentIndex) => {
    // Record result for non-example words only
    const wordToRecord = words[currentIndex];
    if (wordToRecord && !wordToRecord.isExample) {
      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: wordToRecord.word,
            playerClickedAudioButton: playerClickedAudioButton,
          },
        ],
      }));
    }

    // Reset the audio button flag for the next word
    setPlayerClickedAudioButton(false);

    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentWordIndex(nextIndex);
      setHighlightStage("none");
      setTimeout(() => startWordHighlighting(nextIndex), 100);
    } else {
      // Game completed
      setGameCompleted(true);
      setTimeout(() => {
        stopRecording();
      }, 100);
    }
  };

  // Function to highlight text parts
  const highlightWord = () => {
    if (!currentWord) return "";

    const { word, root } = currentWord;

    if (highlightStage === "none") {
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

  // Play title-instructions audio on mount
  useEffect(() => {
    if (!gameStarted && !hasPlayedInitialAudio && titleAudioRef.current) {
      setIsInitialAudioPlaying(true);
      const timer = setTimeout(() => {
        titleAudioRef.current
          .play()
          .then(() => {
            setHasPlayedInitialAudio(true);
          })
          .catch((error) => {
            console.error("Error playing title audio:", error);
            setIsInitialAudioPlaying(false);
            setHasPlayedInitialAudio(true);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameStarted, hasPlayedInitialAudio, titleAudioRef]);

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameCompleted) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted]);

  // Start screen
  if (!gameStarted) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered">
          <Col md={12} lg={10}>
            <Card className="main-card">
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h4 className="mb-0">Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-center">
                  <Button
                    variant="dark"
                    size="lg"
                    onClick={startGame}
                    disabled={isInitialAudioPlaying}
                    className="mb-4 rounded-circle"
                    style={{
                      width: "100px",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      backgroundColor: isInitialAudioPlaying ? "#666666" : "#000000",
                      border: "none",
                      opacity: isInitialAudioPlaying ? 0.6 : 1,
                      cursor: isInitialAudioPlaying ? "not-allowed" : "pointer",
                    }}
                  >
                    <svg width="40" height="40" fill="white" viewBox="0 0 16 16">
                      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V14h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-1.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
                      <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
                    </svg>
                  </Button>
                </div>
                <audio ref={titleAudioRef} src={titleInstructionsAudio} />
                <audio ref={wordAudioRef} src={currentWordAudio} />
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
        <Row className="game-row-centered">
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
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {currentWord.isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div
                className="display-4 font-weight-bold p-4"
                style={{
                  minHeight: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {highlightWord()}
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <Button
                  variant="light"
                  size="lg"
                  onClick={playWordAudio}
                  disabled={!currentWordAudio || isWordAudioPlaying || hasPlayedWordAudio}
                  className="rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    border: "2px solid #6c757d",
                    opacity: !currentWordAudio || isWordAudioPlaying || hasPlayedWordAudio ? 0.6 : 1,
                  }}
                >
                  <i className="bi bi-volume-up" style={{ fontSize: "30px", color: "#6c757d" }}></i>
                </Button>
              </div>
              <div className="d-flex justify-content-center mt-3">
                <Button variant="success" size="lg" onClick={handleNextQuestion} disabled={!canProceed} style={{ minWidth: "200px" }}>
                  Επόμενη Λέξη
                </Button>
              </div>
              <audio ref={wordAudioRef} src={currentWordAudio} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game3;
