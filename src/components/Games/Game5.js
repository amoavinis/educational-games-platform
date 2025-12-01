// Game 5
import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game5Compounds } from "../Data/Game5Data";
import useAudio from "../../hooks/useAudio";
import titleAudio from "../../assets/sounds/05/title.mp3";
import pressPlayAudio from "../../assets/sounds/general/press-play.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

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
      // Note: μαυροσκούφης has no audio file
    }),
    []
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [separatorPosition, setSeparatorPosition] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isTitleAudioPlaying, setIsTitleAudioPlaying] = useState(false);
  const [isPressPlayAudioPlaying, setIsPressPlayAudioPlaying] = useState(false);
  const [hasPlayedTitleAudio, setHasPlayedTitleAudio] = useState(false);
  const [hasPlayedPressPlayAudio, setHasPlayedPressPlayAudio] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);

  const compounds = useMemo(() => game5Compounds, []);

  // Title audio
  const { audioRef: titleAudioRef } = useAudio(titleAudio, {
    playOnMount: false,
  });

  // Press-play audio
  const { audioRef: pressPlayAudioRef } = useAudio(pressPlayAudio, {
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
      setIsTitleAudioPlaying(false);
      // Play press-play audio after title finishes
      if (!hasPlayedPressPlayAudio) {
        setIsPressPlayAudioPlaying(true);
        setTimeout(() => {
          if (pressPlayAudioRef.current) {
            pressPlayAudioRef.current
              .play()
              .then(() => {
                setHasPlayedPressPlayAudio(true);
              })
              .catch((error) => {
                console.error("Error playing press-play audio:", error);
                setIsPressPlayAudioPlaying(false);
                setHasPlayedPressPlayAudio(true);
              });
          }
        }, 100);
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef, hasPlayedPressPlayAudio, pressPlayAudioRef]);

  // Listen for press-play audio ended
  useEffect(() => {
    const audio = pressPlayAudioRef.current;
    const handleEnded = () => {
      setIsPressPlayAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [pressPlayAudioRef]);

  // Play title audio on mount
  useEffect(() => {
    if (!hasPlayedTitleAudio && titleAudioRef.current) {
      setIsTitleAudioPlaying(true);
      const timer = setTimeout(() => {
        titleAudioRef.current
          .play()
          .then(() => {
            setHasPlayedTitleAudio(true);
          })
          .catch((error) => {
            console.error("Error playing title audio:", error);
            setIsTitleAudioPlaying(false);
            setHasPlayedTitleAudio(true);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasPlayedTitleAudio, titleAudioRef]);

  // Start timing when question loads (but not during audio playback)
  useEffect(() => {
    if (!isTitleAudioPlaying && !isPressPlayAudioPlaying) {
      setQuestionStartTime(Date.now());
    }
  }, [currentWordIndex, isTitleAudioPlaying, isPressPlayAudioPlaying]);

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
    if (!isAnswered && !isTitleAudioPlaying && !isPressPlayAudioPlaying) {
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

    setTimeout(() => {
      if (currentWordIndex < compounds.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setSeparatorPosition(null);
        setIsAnswered(false);
        setIsCorrect(false);
        setQuestionStartTime(null); // Reset timing for next question
      } else {
        setShowResults(true);
        submitGameResults();
      }
    }, 10000);
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
                <h4 className="mb-0">Χωρίζω τη σύνθετη λέξη με κάθετη γραμμή</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="bg-light p-4 rounded border mb-4">
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => setGameStarted(true)}
                      disabled={isTitleAudioPlaying || isPressPlayAudioPlaying}
                      className="px-5 py-3"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        opacity: isTitleAudioPlaying || isPressPlayAudioPlaying ? 0.6 : 1,
                        cursor: isTitleAudioPlaying || isPressPlayAudioPlaying ? "not-allowed" : "pointer",
                      }}
                    >
                      ΠΑΜΕ!
                    </Button>
                  </div>
                </div>
                <audio ref={titleAudioRef} src={titleAudio} />
                <audio ref={pressPlayAudioRef} src={pressPlayAudio} />
                <audio ref={wordAudioRef} src={currentWordAudio} />
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
        </span>
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
          </span>
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
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">
                {compounds[currentWordIndex].isExample && <span className="example-badge">Παράδειγμα</span>}
                Χωρίζω τη σύνθετη λέξη με κάθετη γραμμή
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="bg-light p-4 rounded border mb-4">
                <div className="mb-3">{renderWord()}</div>

                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  {!isAnswered ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        disabled={separatorPosition === null || isTitleAudioPlaying || isPressPlayAudioPlaying}
                        className="btn btn-primary px-4 py-2 text-white rounded"
                      >
                        Υποβολή
                      </button>

                      <button
                        onClick={() => setSeparatorPosition(null)}
                        disabled={isTitleAudioPlaying || isPressPlayAudioPlaying}
                        className="btn px-4 py-2 text-white rounded btn-dark"
                      >
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

              {/* <div className="text-center">
          <button onClick={resetGame} className="btn btn-secondary px-4 py-2">
            Επανάληψη
          </button>
        </div> */}
              <audio ref={titleAudioRef} src={titleAudio} />
              <audio ref={pressPlayAudioRef} src={pressPlayAudio} />
              <audio ref={wordAudioRef} src={currentWordAudio} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game5;
