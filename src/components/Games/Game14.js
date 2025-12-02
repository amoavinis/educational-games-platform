// Game 14
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game14Questions } from "../Data/Game14Data";
import useAudio from "../../hooks/useAudio";

// Import audio files
import titleAudio from "../../assets/sounds/14/title.mp3";
import instructionsAudio from "../../assets/sounds/14/instructions.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

import exampleKaterinaScholioAudio from "../../assets/sounds/14/example-Κατερίνα σχολείο.mp3";
import exampleTaxiChorosmeniAudio from "../../assets/sounds/14/example-ταξη χωρισμένη.mp3";
import ανευθυνότηταAudio from "../../assets/sounds/14/ανευθυνότητα.mp3";
import αρχηγείοAudio from "../../assets/sounds/14/αρχηγείο.mp3";
import ασφαλιστήςAudio from "../../assets/sounds/14/ασφαλιστής.mp3";
import ηλεκτρισμόAudio from "../../assets/sounds/14/ηλεκτρισμό.mp3";
import καταδικασμένοςAudio from "../../assets/sounds/14/καταδικασμένος.mp3";
import κουρασμένηAudio from "../../assets/sounds/14/κουρασμένη.mp3";
import λιμεναρχείοAudio from "../../assets/sounds/14/λιμεναρχείο.mp3";
import μαρμάρινοςAudio from "../../assets/sounds/14/μαρμάρινος.mp3";
import πικράAudio from "../../assets/sounds/14/πικρά.mp3";
import χρήσιμοAudio from "../../assets/sounds/14/χρήσιμο.mp3";

const Game14 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [wasAnswerSubmitted, setWasAnswerSubmitted] = useState(false);

  const questions = useMemo(() => game14Questions, []);

  // Map sentences to their audio files (extract key words from sentences)
  const sentenceAudioMap = useMemo(
    () => ({
      "Το άγαλμα είναι μαρμάρ____.": μαρμάρινοςAudio,
      "Η λάμπα ανάβει με ηλεκτρ______.": ηλεκτρισμόAudio,
      "Ο Κώστας δουλεύει στο λιμεναρχ________.": λιμεναρχείοAudio,
      "Τα αμύγδαλα ήταν πικρ________.": πικράAudio,
      "Ο μπαμπάς μου δουλεύει ως ασφαλ__________.": ασφαλιστήςAudio,
      "Οι αστυνομικοί πήγαν στο αρχηγ______.": αρχηγείοAudio,
      "Η Μαντώ δεν ήταν καλά γιατί ήταν κουρασ__________.": κουρασμένηAudio,
      "Χάλασε το παιχνίδι του από ανευθυν___________.": ανευθυνότηταAudio,
      "Το σχόλιο του κριτή ήταν χρήσ_______ για το κοινό.": χρήσιμοAudio,
      "Ο ληστής ήταν καταδικασ_______ από το δικαστήριο για 10 χρόνια.": καταδικασμένοςAudio,
      "Η τάξη είναι χωρισ_____ στα δύο.": exampleTaxiChorosmeniAudio,
      "Η Κατερίνα κάνει μαθήματα στο σχολ______.": exampleKaterinaScholioAudio,
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

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  const { audioRef: wordAudioRef, audioSrc: wordAudioSrc } = useAudio(null, {
    playOnMount: false,
  });

  // Log game results function
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
      gameName: "GreekAdjectiveEndingGame",
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
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  }, [studentId, classId, gameResults, schoolId, gameId]);

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      const question = questions[currentQuestion];

      // Only play practice end audio if this was from an answer submission and it's the last example
      if (wasAnswerSubmitted && question.isExample && currentQuestion < questions.length - 1 && !questions[currentQuestion + 1].isExample) {
        setTimeout(() => {
          if (practiceEndAudioRef.current) {
            practiceEndAudioRef.current
              .play()
              .then(() => {
                console.log("Practice end audio started playing");
              })
              .catch((error) => {
                console.error("Error playing end of practice audio:", error);
              });
          }
        }, 100);
      } else {
        setWasAnswerSubmitted(false); // Reset for next time
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef, currentQuestion, questions, practiceEndAudioRef, wasAnswerSubmitted]);

  // Listen for practice end audio ended
  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWasAnswerSubmitted(false);

      // Advance to next question after practice end audio finishes
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setQuestionStartTime(null);
      } else {
        setGameState("results");
        submitGameResults();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef, currentQuestion, questions, submitGameResults]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    setSelectedAnswer(answer);

    // Check if this is the last example
    const isLastExample = question.isExample && currentQuestion < questions.length - 1 && !questions[currentQuestion + 1].isExample;

    // Play the word audio for the sentence using the ref
    const wordAudio = sentenceAudioMap[question.sentence];
    if (wordAudio && wordAudioRef.current) {
      wordAudioRef.current.src = wordAudio;
      wordAudioRef.current.play().catch((error) => {
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

    if (isLastExample) {
      // Mark that answer was submitted for last example
      setWasAnswerSubmitted(true);
      // Don't auto-advance, wait for word audio then practice end audio to finish
    } else {
      // Auto advance after 5 seconds
      setTimeout(() => {
        nextQuestion();
      }, 5000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameState("results");
      submitGameResults();
    }
  };

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

  // Start timing when question loads and audio is done
  useEffect(() => {
    if (gameState === "playing" && !isAudioPlaying) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameState, isAudioPlaying]);

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameState === "results") {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameState]);

  const question = questions[currentQuestion];

  if (gameState === "results") {
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
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <audio ref={wordAudioRef} src={wordAudioSrc} />

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
              <h4 className="mb-0 game-title-header">Διαλέγω το σωστό κλιτικό επίθημα</h4>
            </Card.Header>
            <Card.Body>
              <Card className="mb-4 border-primary">
                <Card.Body className="text-center">
                  <h3 className="display-5 mb-4 text-primary">{question.sentence}</h3>

                  {selectedAnswer && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <p className="mb-0 text-muted" style={{ fontSize: "1.1rem" }}>
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Row className="justify-content-center mb-4">
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
                    <Col key={index} xs={4} className="mb-3 d-flex justify-content-center">
                      <Button
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null || isAudioPlaying}
                        variant={variant}
                        style={customStyle}
                        size="lg"
                        className="py-3 w-100"
                      >
                        {option}
                        {showIcon && <span className="ms-2 fs-4">{showIcon}</span>}
                      </Button>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game14;
