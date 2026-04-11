// Game 3
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import CustomWordSlider from "../CustomWordSlider";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { uploadAudioRecording } from "../../services/audioStorage";
import { game3Words } from "../Data/Game3Data";
import useAudio from "../../hooks/useAudio";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

// Import word audio files
import grafeasAudio from "../../assets/sounds/03/γραφέας.mp3";
import grafioAudio from "../../assets/sounds/03/γραφείο.mp3";
import grafistasAudio from "../../assets/sounds/03/γραφίστας.mp3";
import grafikosAudio from "../../assets/sounds/03/γραφικός.mp3";
import kleidonoAudio from "../../assets/sounds/03/κλειδώνω.mp3";
import kleidomenos from "../../assets/sounds/03/κλειδωμένος.mp3";
import organonoAudio from "../../assets/sounds/03/οργανώνω.mp3";
import grafidaAudio from "../../assets/sounds/03/γραφίδα.mp3";
import grafikotitaAudio from "../../assets/sounds/03/γραφικότητα.mp3";
import organotikosAudio from "../../assets/sounds/03/οργανωτικός.mp3";
import organotisAudio from "../../assets/sounds/03/οργανωτής.mp3";
import organomenosAudio from "../../assets/sounds/03/οργανωμένος.mp3";
import klidiAudio from "../../assets/sounds/03/κλειδί.mp3";
import klidosiAudio from "../../assets/sounds/03/κλείδωση.mp3";
import skupizoAudio from "../../assets/sounds/03/σκουπίζω.mp3";
import skupidiAudio from "../../assets/sounds/03/σκουπίδι.mp3";
// import skupistosAudio from "../../assets/sounds/03/σκουπιστός.mp3";
import skupismenosAudio from "../../assets/sounds/03/σκουπισμένος.mp3";
import potizoAudio from "../../assets/sounds/03/ποτίζω.mp3";
import potismaAudio from "../../assets/sounds/03/πότισμα.mp3";
import potistiriAudio from "../../assets/sounds/03/ποτιστήρι.mp3";
import xipnoAudio from "../../assets/sounds/03/ξυπνώ.mp3";
import xipnisaAudio from "../../assets/sounds/03/ξύπνησα.mp3";
import xipnondasAudio from "../../assets/sounds/03/ξυπνώντας.mp3";
import xipnitiriAudio from "../../assets/sounds/03/ξυπνητήρι.mp3";
import xipnitosAudio from "../../assets/sounds/03/ξυπνητός.mp3";
import xipnimaAudio from "../../assets/sounds/03/ξύπνημα.mp3";
import magirevoAudio from "../../assets/sounds/03/μαγειρεύω.mp3";
import magiremenosAudio from "../../assets/sounds/03/μαγειρεμένος.mp3";
import magirissaAudio from "../../assets/sounds/03/μαγείρισσα.mp3";
import magirikosAudio from "../../assets/sounds/03/μαγειρικός.mp3";
import magirioAudio from "../../assets/sounds/03/μαγειρείο.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import demoVideo from "../../assets/video/DEMO 3.mp4";

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

const Game3 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => game3Words, []);

  // Map words to their audio files
  const wordAudioMap = useMemo(
    () => ({
      γραφείο: grafioAudio,
      γραφίστας: grafistasAudio,
      γραφικός: grafikosAudio,
      γραφέας: grafeasAudio,
      γραφίδα: grafidaAudio,
      γραφικότητα: grafikotitaAudio,
      οργανώνω: organonoAudio,
      οργανωτικός: organotikosAudio,
      οργανωτής: organotisAudio,
      οργανωμένος: organomenosAudio,
      κλειδώνω: kleidonoAudio,
      κλειδί: klidiAudio,
      κλειδωμένος: kleidomenos,
      κλείδωση: klidosiAudio,
      σκουπίζω: skupizoAudio,
      σκουπίδι: skupidiAudio,
      // σκουπιστός: skupistosAudio,
      σκουπισμένος: skupismenosAudio,
      ποτίζω: potizoAudio,
      πότισμα: potismaAudio,
      // ποτίστρα: null,
      ποτιστήρι: potistiriAudio,
      ξυπνώ: xipnoAudio,
      ξύπνησα: xipnisaAudio,
      ξυπνώντας: xipnondasAudio,
      ξυπνητήρι: xipnitiriAudio,
      ξυπνητός: xipnitosAudio,
      ξύπνημα: xipnimaAudio,
      μαγειρεύω: magirevoAudio,
      μαγειρεμένος: magiremenosAudio,
      μαγείρισσα: magirissaAudio,
      μαγειρικός: magirikosAudio,
      μαγειρείο: magirioAudio,
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
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);
  const prevSliderSectionRef = useRef(null);
  const [playerClickedAudioButton, setPlayerClickedAudioButton] = useState(false);

  const currentWord = words[currentWordIndex];

  // Word-specific audio
  const { audioRef: wordAudioRef } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  const { audioRef: practiceEndAudioRef } = useAudio(practiceEnd, { playOnMount: false });

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
  }, [wordAudioRef]);

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
      // 1. Determine if this is the final example before the real test begins
      const isLastExample = currentWord.isExample && currentWordIndex < words.length - 1 && !words[currentWordIndex + 1].isExample;

      if (isLastExample) {
        // 2. Enter 'waiting' state and play the "End of Practice" instructions
        setWaitingForPracticeEnd(true);
        if (practiceEndAudioRef.current) {
          practiceEndAudioRef.current.play().catch((error) => {
            console.error("Error playing practice end audio:", error);
            // Fallback: If audio fails, just move to the next word
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

      const audioFile = word && wordAudioMap[word.word] ? wordAudioMap[word.word] : null;
      setCurrentWordAudio(audioFile);

      setIsWordAudioPlaying(false);
      setCanProceed(false);
    },
    [wordAudioMap, words],
  );

  // Move to next word
  const nextWord = useCallback(
    (currentIndex) => {
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
      // Reset slider highlighting
      setSliderHighlight({ sectionIndex: -1, subPosition: "start" });

      if (currentIndex < words.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentWordIndex(nextIndex);
        setTimeout(() => setWordAudioCb(nextIndex), 100);
      } else {
        // Game completed
        setGameCompleted(true);
        setTimeout(() => {
          stopRecording();
        }, 100);
      }
    },
    [playerClickedAudioButton, setWordAudioCb, stopRecording, words],
  );

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
      nextWord(currentWordIndex);
    };
    audio?.addEventListener("ended", handleEnded);
    return () => audio?.removeEventListener("ended", handleEnded);
  }, [practiceEndAudioRef, currentWordIndex, nextWord]);

  // Handle slider change
  const handleSliderChange = (sectionIndex, subPosition) => {
    setSliderHighlight({ sectionIndex, subPosition });

    const isAtEnd = sectionIndex === 1 && subPosition === "end";
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
    const { word, root } = currentWord;
    return [
      { text: root, color: "blue" },
      { text: word.substring(root.length), color: "green" },
    ];
  }, [currentWord]);

  // Function to highlight text parts based on slider position
  const highlightWord = () => {
    if (!currentWord) return "";

    const { word, root } = currentWord;
    const rootEnd = root.length;

    let result = [];

    // Determine highlighting based on slider position
    let highlightRoot = true;
    let highlightSuffix = true;

    if (sliderHighlight.sectionIndex === 0) {
      // In root section
      if (sliderHighlight.subPosition === "middle" || sliderHighlight.subPosition === "end") {
        highlightRoot = false;
      }
    } else if (sliderHighlight.sectionIndex === 1) {
      // In suffix section
      highlightRoot = false;
      if (sliderHighlight.subPosition === "middle" || sliderHighlight.subPosition === "end") {
        highlightSuffix = false;
      }
    }

    // Apply highlighting
    if (highlightRoot) {
      result.push(
        <span key="root" style={{ color: "blue" }}>
          {word.substring(0, rootEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(0, rootEnd));
    }

    if (highlightSuffix) {
      result.push(
        <span key="suffix" style={{ color: "green" }}>
          {word.substring(rootEnd)}
        </span>,
      );
    } else {
      result.push(word.substring(rootEnd));
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

  return (
    <Container fluid className="game-container">
      {/* MOVE AUDIO TAGS HERE - BEFORE ANY IF STATEMENTS */}
      <audio ref={wordAudioRef} src={currentWordAudio} />
      <audio ref={practiceEndAudioRef} src={practiceEnd} />

      {!gameStarted ? (
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : gameCompleted ? (
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
      ) : currentWord ? (
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
                <h4 className="mb-0">Διαβάζω την κάθε λέξη όσο καλύτερα μπορώ</h4>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Container>
  );
};

export default Game3;
