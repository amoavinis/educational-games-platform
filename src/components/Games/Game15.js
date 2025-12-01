// Game 15
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game15Questions } from "../Data/Game15Data";
import useAudio from "../../hooks/useAudio";

// Import audio files
import titleAudio from "../../assets/sounds/15/title.mp3";
import instructionsAudio from "../../assets/sounds/15/instructions.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import exampleGataMikriAudio from "../../assets/sounds/15/example-η γάτα είναι μικρή.mp3";
import exampleKairosAudio from "../../assets/sounds/15/example-ο καιρός.mp3";
import examplePaidiAudio from "../../assets/sounds/15/example-παιδί.mp3";
import ανοιχτόAudio from "../../assets/sounds/15/ανοιχτό.mp3";
import απρόσμεναAudio from "../../assets/sounds/15/απρόσμενα.mp3";
import διακοπώνAudio from "../../assets/sounds/15/διακοπών.mp3";
import εισόδουςAudio from "../../assets/sounds/15/εισόδους.mp3";
import ζεστάAudio from "../../assets/sounds/15/ζεστά.mp3";
import θάλασσαAudio from "../../assets/sounds/15/θάλασσα.mp3";
import κινδύνουAudio from "../../assets/sounds/15/κινδύνου.mp3";
import κυβερνήσεωνAudio from "../../assets/sounds/15/κυβερνήσεων.mp3";
import μεγάληAudio from "../../assets/sounds/15/μεγάλη.mp3";
import μεθόδουςAudio from "../../assets/sounds/15/μεθόδους.mp3";
import μουσικήςAudio from "../../assets/sounds/15/μουσικής.mp3";
import ΧριστουγέννωνAudio from "../../assets/sounds/15/Χριστουγέννων.mp3";

const Game15 = ({ gameId, schoolId, studentId: propStudentId, classId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Get student ID from props or URL parameters
  const searchParams = new URLSearchParams(location.search);
  const studentId = propStudentId || searchParams.get("studentId") || "unknown";
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isMarqueeActive, setIsMarqueeActive] = useState(true);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const marqueeRef = useRef(null);
  const containerRef = useRef(null);

  const questions = useMemo(() => game15Questions, []);

  // Map result sentences to their audio files
  const resultAudioMap = useMemo(
    () => ({
      "Η γάτα είναι μικρή": exampleGataMikriAudio,
      "Ο καιρός σήμερα είναι πολύ ζεστός": exampleKairosAudio,
      "Το παιδί κοιμήθηκε ήσυχο": examplePaidiAudio,
      "Τα δελφίνια αγαπούν τη θάλασσα": θάλασσαAudio,
      "Η πορεία έκλεισε όλες τις ανοιχτές εισοδ": εισόδουςAudio,
      "Εξαφανίστηκαν όλοι την ώρα του κινδύνου": κινδύνουAudio,
      "Στο βουνό ντυνόμαστε ζεστά": ζεστάAudio,
      "Ήταν μικρή διάρκεια των διακοπών": διακοπώνAudio,
      "Το φως της σκηνής ήταν ανοιχτό": ανοιχτόAudio,
      "Το παράθυρο χάλασε απρόσμενα": απρόσμεναAudio,
      "Ήταν αυστηρές οι αποφάσεις των κυβερνήσεων": κυβερνήσεωνAudio,
      "Μου αρέσουν διάφορα είδη μουσικής": μουσικήςAudio,
      "Μας επισκέφτηκε παραμονή Χριστουγέννων": ΧριστουγέννωνAudio,
      "Η διάρκεια του ταξιδιού ήταν μεγάλη": μεγάληAudio,
      "Ο γιατρός είχε νέες μεθόδους": μεθόδουςAudio,
    }),
    []
  );

  // Title audio
  const { audioRef: titleAudioRef, audioSrc: titleAudioSrc } = useAudio(titleAudio, {
    playOnMount: false,
  });

  // Instructions audio
  const { audioRef: instructionsAudioRef, audioSrc: instructionsAudioSrc } = useAudio(instructionsAudio, {
    playOnMount: false,
  });

  // Play title audio on mount
  useEffect(() => {
    if (!hasPlayedInitialAudio) {
      const timer = setTimeout(() => {
        if (titleAudioRef.current) {
          titleAudioRef.current
            .play()
            .then(() => {
              setHasPlayedInitialAudio(true);
            })
            .catch((error) => {
              console.error("Error playing title audio:", error);
              setIsAudioPlaying(false);
              setHasPlayedInitialAudio(true);
            });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasPlayedInitialAudio, titleAudioRef]);

  // Listen for title audio ended, then play instructions audio
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      if (instructionsAudioRef.current) {
        instructionsAudioRef.current.play().catch((error) => {
          console.error("Error playing instructions audio:", error);
          setIsAudioPlaying(false);
        });
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
      setIsAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [instructionsAudioRef]);

  // Position text off-screen to the right while audio is playing
  useEffect(() => {
    if (isAudioPlaying) {
      const container = containerRef.current;
      const textElement = marqueeRef.current;

      if (!container || !textElement) return;

      const containerWidth = container.offsetWidth;
      textElement.style.transition = "none";
      textElement.style.left = `${containerWidth}px`;
      textElement.style.visibility = "visible";
    }
  }, [isAudioPlaying, currentQuestion]);

  useEffect(() => {
    if (!isMarqueeActive || isAudioPlaying) return;

    const container = containerRef.current;
    const textElement = marqueeRef.current;

    if (!container || !textElement) return;

    // Reset styles - start with first letter at right edge
    textElement.style.transition = "none";
    textElement.style.visibility = "visible";

    // Force reflow to apply reset styles
    textElement.getBoundingClientRect();

    const containerWidth = container.offsetWidth;
    const textWidth = textElement.offsetWidth;

    // Start with first letter at right edge of container
    textElement.style.left = `${containerWidth}px`;
    textElement.style.transform = "translateX(0)";

    // Force reflow
    textElement.getBoundingClientRect();

    // Move left until last letter is visible (stop when text fits completely)
    const stopOffset = containerWidth - textWidth;

    textElement.style.transition = "left 3s ease-out";
    textElement.style.left = `${stopOffset}px`;

    const handleTransitionEnd = () => {
      setIsMarqueeActive(false);
      textElement.removeEventListener("transitionend", handleTransitionEnd);
      // Start timing when buttons appear
      setQuestionStartTime(Date.now());
    };

    textElement.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      textElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [currentQuestion, isMarqueeActive, isAudioPlaying]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    setSelectedAnswer(answer);

    // Play the word audio for the result
    const wordAudio = resultAudioMap[question.result];
    if (wordAudio) {
      const audio = new Audio(wordAudio);
      audio.play().catch((error) => {
        console.error("Error playing word audio:", error);
      });
    }

    // Track the result only for non-example questions
    if (!question.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: question.sentence,
          result: answer,
          target: question.correct,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 4000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
      setIsMarqueeActive(true);
      // Hide current text first, then change question
      const textElement = marqueeRef.current;
      if (textElement) {
        textElement.style.visibility = "hidden";
      }
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 50);
    } else {
      setGameCompleted(true);
    }
  };

  // Use effect to log results when game completes
  useEffect(() => {
    // Log game results function
    const submitGameResults = async (finalResults) => {
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
        gameName: "GreekSuffixMarqueeGame",
        questions: finalResults,
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

    if (gameCompleted) {
      submitGameResults(gameResults);
    }
  }, [classId, gameCompleted, gameId, gameResults, schoolId, studentId]);

  const question = questions[currentQuestion];

  // Center the text when answer is selected
  useEffect(() => {
    if (selectedAnswer) {
      const textElement = marqueeRef.current;
      const container = containerRef.current;
      if (textElement && container) {
        const containerWidth = container.offsetWidth;
        const textWidth = textElement.offsetWidth;
        const centerOffset = (containerWidth - textWidth) / 2;
        textElement.style.transition = "left 0.5s ease";
        textElement.style.left = `${centerOffset}px`;
      }
    }
  }, [selectedAnswer]);

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
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.filter((q) => !q.isExample).length}
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
      {/* Audio elements */}
      <audio ref={titleAudioRef} src={titleAudioSrc} />
      <audio ref={instructionsAudioRef} src={instructionsAudioSrc} />

      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          {questions[currentQuestion].isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Διαλέγω το κατάλληλο επίθημα όσο πιο γρήγορα μπορώ</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="rounded mb-4">
                {/* Marquee container */}
                <div
                  ref={containerRef}
                  className="marquee-container mb-4"
                  style={{
                    width: "600px",
                    margin: "0 auto",
                    padding: "20px 0",
                    display: "block",
                    minHeight: "80px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    ref={marqueeRef}
                    className="marquee-text"
                    style={{
                      position: "absolute",
                      whiteSpace: "nowrap",
                      transition: "left 3s ease-out",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      visibility: "visible",
                    }}
                  >
                    {selectedAnswer ? question.result : question.sentence}
                  </div>
                </div>

                {!isMarqueeActive && (
                  <Row className="g-3 mb-4">
                    {question.options.map((option, index) => {
                      let variant = "outline-primary";
                      let customStyle = {};
                      let showIcon = null;

                      if (selectedAnswer === option) {
                        if (option === question.correct) {
                          variant = "success";
                          customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                          showIcon = "✓";
                        } else {
                          variant = "danger";
                          customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                          showIcon = "✗";
                        }
                      } else if (selectedAnswer && option === question.correct) {
                        variant = "success";
                        customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                        showIcon = "✓";
                      }

                      return (
                        <Col key={index} xs={4}>
                          <Button
                            variant={variant}
                            style={customStyle}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={selectedAnswer !== null}
                            className="w-100 py-3"
                          >
                            {option}
                            {showIcon && (
                              <span className="ms-2 fs-4" style={{ marginTop: 0, marginBottom: 0, lineHeight: 1 }}>
                                {showIcon}
                              </span>
                            )}
                          </Button>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game15;
