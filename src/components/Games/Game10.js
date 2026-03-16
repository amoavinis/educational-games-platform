// Game 10
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game10Words } from "../Data/Game10Data";
import useAudio from "../../hooks/useAudio";

import titleAudio from "../../assets/sounds/10/title.mp3";
import instructionsAudio from "../../assets/sounds/10/instructions.mp3";

// Import word audio files
import exampleAntistrofosAudio from "../../assets/sounds/10/example-αντίστροφος.mp3";
import exampleKatastrefoAudio from "../../assets/sounds/10/example-καταστρέφω.mp3";
import exampleEpilegoAudio from "../../assets/sounds/10/example-επιλέγω.mp3";
import yperfortoshAudio from "../../assets/sounds/10/υπερφόρτωση.mp3";
import antistathmisiAudio from "../../assets/sounds/10/αντιστάθμιση.mp3";
import epikentronoAudio from "../../assets/sounds/10/επικεντρώνω.mp3";
import aponevromenos from "../../assets/sounds/10/απονευρωμένος.mp3";
import paraplevrosAudio from "../../assets/sounds/10/παράπλευρος.mp3";
import katapiestikiAudio from "../../assets/sounds/10/καταπιεστική.mp3";
import dystropiaAudio from "../../assets/sounds/10/δυστροπία.mp3";
import dystyxisaAudio from "../../assets/sounds/10/δυστύχησα.mp3";
import anadasonomaiAudio from "../../assets/sounds/10/αναδασώνομαι.mp3";
import ypotimisiAudio from "../../assets/sounds/10/υποτίμηση.mp3";
import diafotismosAudio from "../../assets/sounds/10/διαφωτισμός.mp3";
import dysarmonikosAudio from "../../assets/sounds/10/δυσαρμονικός.mp3";
import yptertonizoAudio from "../../assets/sounds/10/υπερτονίζω.mp3";
import antistoixoAudio from "../../assets/sounds/10/αντιστοιχώ.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEndAudio from "../../assets/sounds/general/end-of-practice.mp3";

const RecordingIndicator = () => (
  <div className="recording-wave">
    <div className="wave-bars-left">
    <span className="wave-bar"></span>
    <span className="wave-bar"></span>
      <span className="wave-bar"></span>
    </div>
    <div className="microphone-icon">
      <svg width="24" height="24" fill="#ff4d4d" viewBox="0 0 16 16">
        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V14h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-1.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
        <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
      </svg>
    </div>
    <div className="wave-bars-right">
    <span className="wave-bar"></span>
    <span className="wave-bar"></span>
    <span className="wave-bar"></span>
    </div>
  </div>
);

const Game10 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game10Words, []);

  // Map words to their audio files
  const wordAudioMap = useMemo(
    () => ({
      αντίστροφος: exampleAntistrofosAudio,
      καταστρέφω: exampleKatastrefoAudio,
      επιλέγω: exampleEpilegoAudio,
      υπερφόρτωση: yperfortoshAudio,
      αντιστάθμιση: antistathmisiAudio,
      επικεντρώνω: epikentronoAudio,
      απονευρωμένος: aponevromenos,
      παράπλευρος: paraplevrosAudio,
      καταπιεστική: katapiestikiAudio,
      δυστροπία: dystropiaAudio,
      δυστύχησα: dystyxisaAudio,
      αναδασώνομαι: anadasonomaiAudio,
      υποτίμηση: ypotimisiAudio,
      διαφωτισμός: diafotismosAudio,
      δυσαρμονικός: dysarmonikosAudio,
      υπερτονίζω: yptertonizoAudio,
      αντιστοιχώ: antistoixoAudio,
    }),
    [],
  );

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [highlightStage, setHighlightStage] = useState("none"); // 'none', 'prefix', 'stem', 'suffix', 'full'
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
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const currentWord = words[currentWordIndex];

  // Initial title audio
  const { audioRef: titleAudioRef } = useAudio(titleAudio, {
    playOnMount: false,
  });

  // Initial instructions audio
  const { audioRef: instructionsAudioRef } = useAudio(instructionsAudio, {
    playOnMount: false,
  });

  // Word-specific audio
  const { audioRef: wordAudioRef } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // Practice end audio
  const { audioRef: practiceEndAudioRef } = useAudio(practiceEndAudio, {
    playOnMount: false,
  });

  // Listen for title audio ended, then play instructions
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      if (instructionsAudioRef.current) {
        instructionsAudioRef.current.play().catch((error) => {
          console.error("Error playing instructions audio:", error);
          setIsInitialAudioPlaying(false);
        });
      } else {
        setIsInitialAudioPlaying(false);
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef, instructionsAudioRef]);

  // Listen for instructions audio ended
  useEffect(() => {
    const audio = instructionsAudioRef.current;
    const handleEnded = () => {
      setIsInitialAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [instructionsAudioRef]);

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
    if (timeoutEnded && hasPlayedWordAudio) {
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

      // Check if this is the last example (current word is example and next word is not)
      const isLastExample = currentWord.isExample && currentWordIndex < words.length - 1 && !words[currentWordIndex + 1].isExample;

      if (isLastExample) {
        // Play practice end audio and wait for it to finish
        setWaitingForPracticeEnd(true);
        if (practiceEndAudioRef.current) {
          practiceEndAudioRef.current.play().catch((error) => {
            console.error("Error playing practice end audio:", error);
            setWaitingForPracticeEnd(false);
            nextWord(currentWordIndex);
          });
        }
      } else {
        nextWord(currentWordIndex);
      }
    }
  };

  // Perform highlighting animation
  const performHighlighting = () => {
    const duration = 1200;

    setHighlightStage("prefix");
    setTimeout(() => {
      setHighlightStage("stem");
      setTimeout(() => {
        setHighlightStage("suffix");
        setTimeout(() => {
          setHighlightStage("full");
          setTimeout(() => {
            setHighlightStage("none"); // Reset to black
          }, 2.5 * duration);
        }, duration);
      }, duration);
    }, duration);
  };

  // Start game
  const startGame = async () => {
    await startRecording();
    setGameStarted(true);
    startWordHighlighting(0);
  };

  // Start highlighting sequence for current word
  const startWordHighlighting = useCallback(
    (wordIndex) => {
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

      const fullDuration = 10000;

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
      }, fullDuration);
    },
    [wordAudioMap, wordAudioRef, words],
  );

  // Move to next word
  const nextWord = useCallback(
    (currentIndex) => {
      // Record result for non-example words (use current word before updating index)
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
        setHighlightStage("prefix");
        setTimeout(() => startWordHighlighting(nextIndex), 100);
      } else {
        // Game completed
        setGameCompleted(true);
        // Stop recording after a slight delay to ensure proper cleanup
        setTimeout(() => {
          stopRecording();
        }, 100);
      }
    },
    [playerClickedAudioButton, startWordHighlighting, stopRecording, words],
  );

  // Listen for practice end audio ended
  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
      // Advance to next word after practice end audio finishes
      nextWord(currentWordIndex);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [practiceEndAudioRef, currentWordIndex, nextWord]);

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
        </span>,
      );
    } else {
      result.push(word.substring(0, prefixEnd));
    }

    // Stem highlighting
    if (highlightStage === "stem" || highlightStage === "full") {
      result.push(
        <span key="stem" style={{ color: "red" }}>
          {word.substring(prefixEnd, stemEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(prefixEnd, stemEnd));
    }

    // Suffix highlighting
    if (highlightStage === "suffix" || highlightStage === "full") {
      result.push(
        <span key="suffix" style={{ color: "green" }}>
          {word.substring(stemEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(stemEnd));
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
                <audio ref={titleAudioRef} src={titleAudio} />
                <audio ref={instructionsAudioRef} src={instructionsAudio} />
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
            <QuestionProgressLights
              totalQuestions={gameStats.totalRounds}
              currentQuestion={gameStats.totalRounds}
              answeredQuestions={gameStats.rounds.map((r) => true)}
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

  // Game screen
  if (!currentWord) {
    return null; // Safety check
  }

  return (
    <Container fluid className="game-container">
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {isRecording && <RecordingIndicator />}

          {!currentWord.isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter((w) => !w.isExample).length}
              currentQuestion={words.slice(0, currentWordIndex).filter((w) => !w.isExample).length}
              answeredQuestions={gameStats.rounds.map((r) => true)}
            />
          )}
          {currentWord.isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div
                className="display-4 font-weight-bold mb-1 p-4"
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
                <Button variant="success" size="lg" onClick={handleNextQuestion} disabled={!canProceed || waitingForPracticeEnd} style={{ minWidth: "200px" }}>
                  Επόμενη Λέξη
                </Button>
              </div>
              <audio ref={wordAudioRef} src={currentWordAudio} />
              <audio ref={practiceEndAudioRef} src={practiceEndAudio} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game10;
