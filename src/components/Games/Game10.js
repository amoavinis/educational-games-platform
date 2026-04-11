// Game 10
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import CustomWordSlider from "../CustomWordSlider";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game10Words } from "../Data/Game10Data";
import useAudio from "../../hooks/useAudio";

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
import demoVideo from "../../assets/video/DEMO 10.mp4";

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
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sliderHighlight, setSliderHighlight] = useState({ sectionIndex: -1, subPosition: "start" });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [audioDownloadURL, setAudioDownloadURL] = useState(null);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalRounds: 0,
  });
  const [resultsSubmitted, setResultsSubmitted] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [isWordAudioPlaying, setIsWordAudioPlaying] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const prevSliderSectionRef = useRef(null);
  const [playerClickedAudioButton, setPlayerClickedAudioButton] = useState(false);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const currentWord = words[currentWordIndex];

  // Word-specific audio
  const { audioRef: wordAudioRef } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // Practice end audio
  const { audioRef: practiceEndAudioRef } = useAudio(practiceEndAudio, {
    playOnMount: false,
  });

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      setIsWordAudioPlaying(false);
      setCanProceed(true);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef, currentWordAudio]);

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
    if (currentWordAudio && wordAudioRef.current && !isWordAudioPlaying) {
      setPlayerClickedAudioButton(true);
      setIsWordAudioPlaying(true);
      wordAudioRef.current.play().catch((error) => {
        console.error("Error playing word audio:", error);
        setIsWordAudioPlaying(false);
      });
    }
  };

  // Handle next question button click
  const handleNextQuestion = () => {
    if (canProceed) {
      // 1. Check if this is the last example (current word is example and next word is not)
      const isLastExample = currentWord.isExample && currentWordIndex < words.length - 1 && !words[currentWordIndex + 1].isExample;

      if (isLastExample) {
        // 2. Play practice end audio and wait for it to finish
        setWaitingForPracticeEnd(true);
        if (practiceEndAudioRef.current) {
          practiceEndAudioRef.current.play().catch((error) => {
            console.error("Error playing practice end audio:", error);
            setWaitingForPracticeEnd(false);
            nextWord(currentWordIndex);
          });
        }
      } else {
        // 3. If it's a standard word, just move on immediately
        nextWord(currentWordIndex);
      }
    }
  };

  // Start game
  const startGame = async () => {
    await startRecording();
    setGameStarted(true);
    setWordAudioCb(0);
  };

  // Start word display and audio sequence
  const setWordAudioCb = useCallback(
    (wordIndex) => {
      const word = words[wordIndex];

      // Set up word audio or clear if none available
      const audioFile = word && wordAudioMap[word.word] ? wordAudioMap[word.word] : null;
      setCurrentWordAudio(audioFile);

      // Reset states for new word
      setIsWordAudioPlaying(false);
      setCanProceed(false);
    },
    [wordAudioMap, words],
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
      // Reset slider highlighting
      setSliderHighlight({ sectionIndex: -1, subPosition: "start" });

      if (currentIndex < words.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentWordIndex(nextIndex);
        setTimeout(() => setWordAudioCb(nextIndex), 100);
      } else {
        // Game completed
        setGameCompleted(true);
        // Stop recording after a slight delay to ensure proper cleanup
        setTimeout(() => {
          stopRecording();
        }, 100);
      }
    },
    [playerClickedAudioButton, setWordAudioCb, stopRecording, words],
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

  // Handle slider change
  const handleSliderChange = (sectionIndex, subPosition) => {
    setSliderHighlight({ sectionIndex, subPosition });

    const isAtEnd = sectionIndex === 2 && subPosition === "end";
    const wasAtEnd = prevSliderSectionRef.current === "end";
    prevSliderSectionRef.current = isAtEnd ? "end" : null;
    const enteredEnd = isAtEnd && !wasAtEnd;

    if (enteredEnd) {
      if (currentWordAudio && wordAudioRef.current) {
        setIsWordAudioPlaying(true);
        wordAudioRef.current.play().catch((error) => {
          console.error("Error playing word audio:", error);
          setIsWordAudioPlaying(false);
          setCanProceed(true);
        });
      } else {
        setCanProceed(true);
      }
    }
  };

  // Get word sections for slider
  const wordSections = useMemo(() => {
    if (!currentWord) return [];
    const { word, prefix, stem } = currentWord;
    const prefixEnd = prefix.length;
    const stemEnd = prefixEnd + stem.length;
    return [
      { text: prefix, color: "blue" },
      { text: stem, color: "red" },
      { text: word.substring(stemEnd), color: "green" },
    ];
  }, [currentWord]);

  // Function to highlight text parts based on slider position
  const highlightWord = () => {
    if (!currentWord) return "";

    const { word, prefix, stem } = currentWord;
    const prefixEnd = prefix.length;
    const stemEnd = prefixEnd + stem.length;

    let result = [];

    // Determine highlighting based on slider position
    let highlightPrefix = true;
    let highlightStem = true;
    let highlightSuffix = true;

    if (sliderHighlight.sectionIndex === 0) {
      // In prefix section
      if (sliderHighlight.subPosition === "middle" || sliderHighlight.subPosition === "end") {
        highlightPrefix = false;
      }
    } else if (sliderHighlight.sectionIndex === 1) {
      // In stem section
      highlightPrefix = false;
      if (sliderHighlight.subPosition === "middle" || sliderHighlight.subPosition === "end") {
        highlightStem = false;
      }
    } else if (sliderHighlight.sectionIndex === 2) {
      // In suffix section
      highlightPrefix = false;
      highlightStem = false;
      if (sliderHighlight.subPosition === "middle" || sliderHighlight.subPosition === "end") {
        highlightSuffix = false;
      }
    }

    // Apply highlighting
    if (highlightPrefix) {
      result.push(
        <span key="prefix" style={{ color: "blue" }}>
          {word.substring(0, prefixEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(0, prefixEnd));
    }

    if (highlightStem) {
      result.push(
        <span key="stem" style={{ color: "red" }}>
          {word.substring(prefixEnd, stemEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(prefixEnd, stemEnd));
    }

    if (highlightSuffix) {
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
                <h3 className="mb-0">Βίντεο επεξήγησης</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <video width="100%" style={{ maxWidth: "1000px", borderRadius: "8px" }} onEnded={() => setIsVideoEnded(true)} autoPlay controls>
                    <source src={demoVideo} type="video/mp4" />
                  </video>
                </div>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={startGame}
                    disabled={!isVideoEnded}
                    className="px-5 py-3"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      opacity: !isVideoEnded ? 0.6 : 1,
                      cursor: !isVideoEnded ? "not-allowed" : "pointer",
                    }}
                  >
                    ΠΑΜΕ!
                  </Button>
                </div>
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
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    className="display-4 font-weight-bold"
                    style={{
                      minHeight: "150px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {highlightWord()}
                  </div>
                  <CustomWordSlider sections={wordSections} onSliderChange={handleSliderChange} />
                </div>
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <Button
                  variant="light"
                  size="lg"
                  onClick={playWordAudio}
                  disabled={!currentWordAudio || isWordAudioPlaying}
                  className="rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    border: "2px solid #6c757d",
                    opacity: !currentWordAudio || isWordAudioPlaying ? 0.6 : 1,
                  }}
                >
                  <i className="bi bi-volume-up" style={{ fontSize: "30px", color: "#6c757d" }}></i>
                </Button>
              </div>
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleNextQuestion}
                  disabled={!canProceed || waitingForPracticeEnd || isWordAudioPlaying}
                  style={{ minWidth: "200px" }}
                >
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
