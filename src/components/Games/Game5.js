// Game 5
import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game5Compounds } from "../Data/Game5Data";
import useAudio from "../../hooks/useAudio";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";
import demoVideo from "../../assets/video/DEMO 5.mp4";
import "../../styles/Game5.css";

// Import example word audio files
import exampleDomatosalataAudio from "../../assets/sounds/05/example-ντοματοσαλάτα.mp3";
import exampleSpitogatosAudio from "../../assets/sounds/05/example-σπιτόγατος.mp3";

const Game5 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();

  // Map words to their audio files
  const wordAudioMap = useMemo(
    () => ({
      ντοματοσαλάτα: exampleDomatosalataAudio,
      σπιτόγατος: exampleSpitogatosAudio,
    }),
    [],
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [separatorPosition, setSeparatorPosition] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [isPracticeEndPlaying, setIsPracticeEndPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  const compounds = useMemo(() => game5Compounds, []);

  // Word-specific audio
  const { audioRef: wordAudioRef } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // End-of-practice audio
  const { audioRef: practiceEndAudioRef } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  // Start timing when question loads
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentWordIndex]);

  // Play bravo audio when game results are shown
  useEffect(() => {
    if (showResults) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [showResults]);

  const handleSeparatorClick = (position) => {
    if (!isAnswered && !isPracticeEndPlaying) {
      setSeparatorPosition(position === separatorPosition ? null : position);
    }
  };

  const handleSubmit = () => {
    const current = compounds[currentWordIndex];
    const correct = separatorPosition === current.correctPosition;

    const selectedWord = current.word.slice(0, separatorPosition) + "|" + current.word.slice(separatorPosition);

    const correctWord = current.word.slice(0, current.correctPosition) + "|" + current.word.slice(current.correctPosition);

    setIsAnswered(true);
    setIsCorrect(correct);

    // If wrong, show the correct separator position
    if (!correct) {
      setSeparatorPosition(current.correctPosition);
    }

    // Track the result only for non-example questions
    if (!current.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

      setGameResults((prev) => [
        ...prev,
        {
          question: current.word,
          result: selectedWord,
          target: correctWord,
          isCorrect: correct,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Play word audio if available
    const audioFile = wordAudioMap[current.word];
    if (audioFile) {
      setCurrentWordAudio(audioFile);
      setTimeout(() => {
        if (wordAudioRef.current) {
          wordAudioRef.current.play().catch((error) => {
            console.error("Error playing word audio:", error);
          });
        }
      }, 150);
    }

    // Check if this is the last example
    const isLastExample = current.isExample && currentWordIndex < compounds.length - 1 && !compounds[currentWordIndex + 1]?.isExample;

    setTimeout(() => {
      if (currentWordIndex < compounds.length - 1) {
        if (isLastExample) {
          // Play end-of-practice audio and wait for it to finish
          console.log("Playing end-of-practice audio after last example");
          setIsPracticeEndPlaying(true);
          if (practiceEndAudioRef.current) {
            console.log("Audio ref is available, attempting to play");
            const audio = practiceEndAudioRef.current;

            // Attach the ended event listener right before playing
            const handleAudioEnded = () => {
              console.log("Practice end audio finished, advancing to next question");
              setIsPracticeEndPlaying(false);
              setCurrentWordIndex((prev) => prev + 1);
              setSeparatorPosition(null);
              setIsAnswered(false);
              setIsCorrect(false);
              setQuestionStartTime(null);
              // Remove the listener after it fires
              audio.removeEventListener("ended", handleAudioEnded);
            };

            audio.addEventListener("ended", handleAudioEnded);

            audio
              .play()
              .then(() => {
                console.log("Practice end audio started playing successfully");
              })
              .catch((error) => {
                console.error("Error playing end-of-practice audio:", error);
                audio.removeEventListener("ended", handleAudioEnded);
                setIsPracticeEndPlaying(false);
                // If audio fails, advance immediately
                setCurrentWordIndex((prev) => prev + 1);
                setSeparatorPosition(null);
                setIsAnswered(false);
                setIsCorrect(false);
                setQuestionStartTime(null);
              });
          } else {
            // If audio ref not ready, advance immediately
            console.warn("Practice end audio ref not ready");
            setIsPracticeEndPlaying(false);
            setCurrentWordIndex((prev) => prev + 1);
            setSeparatorPosition(null);
            setIsAnswered(false);
            setIsCorrect(false);
            setQuestionStartTime(null);
          }
          // Don't advance yet - the audio ended handler will do it
        } else {
          // Normal advance to next question
          setCurrentWordIndex((prev) => prev + 1);
          setSeparatorPosition(null);
          setIsAnswered(false);
          setIsCorrect(false);
          setQuestionStartTime(null); // Reset timing for next question
        }
      } else {
        setShowResults(true);
        submitGameResults();
      }
    }, 4000);
  };

  // Submit game results function
  const submitGameResults = async () => {
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
      gameName: "WordSeparationGame",
      questions: gameResults,
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

  // Show start screen before game begins
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
                    onClick={() => setGameStarted(true)}
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
      </Container>
    );
  }

  const current = compounds[currentWordIndex];

  const renderWord = () => {
    const letters = current.word.split("");
    const spans = [];

    for (let i = 0; i < letters.length; i++) {
      spans.push(
        <span key={`letter-${i}`} className="fs-3 fw-bold text-primary">
          {letters[i]}
        </span>,
      );

      if (i < letters.length - 1) {
        spans.push(
          <span
            key={`sep-${i + 1}`}
            onClick={() => handleSeparatorClick(i + 1)}
            className="fs-3 fw-bold cursor-pointer"
            style={{
              width: "20px",
              textAlign: "center",
              color: separatorPosition === i + 1 ? "#dc3545" : "transparent",
              userSelect: "none",
            }}
          >
            |
          </span>,
        );
      }
    }

    return <div className="d-flex justify-content-center align-items-center">{spans}</div>;
  };

  if (showResults) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={compounds.filter((c) => !c.isExample).length}
              currentQuestion={compounds.filter((c) => !c.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
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
          {!compounds[currentWordIndex].isExample && (
            <QuestionProgressLights
              totalQuestions={compounds.filter((c) => !c.isExample).length}
              currentQuestion={compounds.slice(0, currentWordIndex).filter((c) => !c.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          {compounds[currentWordIndex].isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Χωρίζω τη σύνθετη λέξη με κάθετη γραμμή</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="bg-light p-4 rounded border mb-4">
                <div className="mb-3">{renderWord()}</div>

                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  {!isAnswered ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        disabled={separatorPosition === null || isPracticeEndPlaying}
                        className="btn btn-primary px-4 py-2 text-white rounded"
                      >
                        Υποβολή
                      </button>

                      <button onClick={() => setSeparatorPosition(null)} disabled={isPracticeEndPlaying} className="btn px-4 py-2 text-white rounded btn-dark">
                        Καθαρισμός
                      </button>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="fs-1" style={{ color: isCorrect ? "#28a745" : "#dc3545" }}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <audio ref={wordAudioRef} src={currentWordAudio} />
              <audio ref={practiceEndAudioRef} src={practiceEnd} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game5;
