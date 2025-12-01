// Game 13
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game13Questions } from "../Data/Game13Data";
import useAudio from "../../hooks/useAudio";

// Import audio files
import titleAudio from "../../assets/sounds/13/title.mp3";
import instructionsAdjectiveAudio from "../../assets/sounds/13/instructions-adjective.mp3";
import instructionsNounAudio from "../../assets/sounds/13/instructions-noun.mp3";
import instructionsMetoхiAudio from "../../assets/sounds/13/instructions-metoxi.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import αμεσότηταAudio from "../../assets/sounds/13/αμεσότητα.mp3";
import γλυκύτηταAudio from "../../assets/sounds/13/γλυκύτητα.mp3";
import γνησιότηταAudio from "../../assets/sounds/13/γνησιότητα.mp3";
import εξήγησηAudio from "../../assets/sounds/13/εξήγηση.mp3";
import ηρωικόςAudio from "../../assets/sounds/13/ηρωικός.mp3";
import κιθαριστήςAudio from "../../assets/sounds/13/κιθαριστής.mp3";
import κλεισμένοςAudio from "../../assets/sounds/13/κλεισμένος.mp3";
import μέτρησηAudio from "../../assets/sounds/13/μέτρηση.mp3";
import τελικόςAudio from "../../assets/sounds/13/τελικός.mp3";
import φαρμακείοAudio from "../../assets/sounds/13/φαρμακείο.mp3";
import φασισμόςAudio from "../../assets/sounds/13/φασισμός.mp3";
import χάρτινοςAudio from "../../assets/sounds/13/χάρτινος.mp3";
import χρωματισμόςAudio from "../../assets/sounds/13/χρωματισμός.mp3";

const Game13 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [instructionAudioPlayed, setInstructionAudioPlayed] = useState(false);

  const questions = useMemo(() => game13Questions, []);

  // Map word results to their audio files
  const wordAudioMap = useMemo(
    () => ({
      αμεσότητα: αμεσότηταAudio,
      γλυκύτητα: γλυκύτηταAudio,
      γνησιότητα: γνησιότηταAudio,
      εξήγηση: εξήγησηAudio,
      ηρωικός: ηρωικόςAudio,
      κιθαριστής: κιθαριστήςAudio,
      κλεισμένος: κλεισμένοςAudio,
      μέτρηση: μέτρησηAudio,
      τελικός: τελικόςAudio,
      φαρμακείο: φαρμακείοAudio,
      φασισμός: φασισμόςAudio,
      χάρτινος: χάρτινοςAudio,
      χρωματισμός: χρωματισμόςAudio,
    }),
    []
  );

  // Title audio
  const { audioRef: titleAudioRef, audioSrc: titleAudioSrc } = useAudio(titleAudio, {
    playOnMount: false,
  });

  // Instruction audios
  const { audioRef: instructionsAdjectiveRef, audioSrc: instructionsAdjectiveSrc } = useAudio(instructionsAdjectiveAudio, { playOnMount: false });
  const { audioRef: instructionsNounRef, audioSrc: instructionsNounSrc } = useAudio(instructionsNounAudio, { playOnMount: false });
  const { audioRef: instructionsMetoхiRef, audioSrc: instructionsMetoхiSrc } = useAudio(instructionsMetoхiAudio, { playOnMount: false });

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    setSelectedAnswer(answer);

    // Play the word audio for the result
    const wordAudio = wordAudioMap[question.result];
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
          question: `${question.instruction} για τη λέξη ${question.baseWord}`,
          result: answer,
          target: question.correct,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Auto advance after 10 seconds
    setTimeout(() => {
      nextQuestion();
    }, 10000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
      setInstructionAudioPlayed(false); // Reset instruction audio state
      setIsAudioPlaying(true); // New question means new instruction audio
    } else {
      setGameState("results");
      submitGameResults();
    }
  };

  // Log game results function
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
      gameName: "GreekWordFormationGame",
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

  // Play title audio on mount
  useEffect(() => {
    if (!hasPlayedInitialAudio && currentQuestion === 0) {
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
  }, [hasPlayedInitialAudio, currentQuestion, titleAudioRef]);

  // Helper function to play the appropriate instruction audio
  const playInstructionAudio = useCallback(() => {
    const question = questions[currentQuestion];
    let audioRef = null;

    if (question.instruction === "ΕΠΙΘΕΤΟ") {
      audioRef = instructionsAdjectiveRef;
    } else if (question.instruction === "ΟΥΣΙΑΣΤΙΚΟ") {
      audioRef = instructionsNounRef;
    } else if (question.instruction === "ΜΕΤΟΧΗ") {
      audioRef = instructionsMetoхiRef;
    }

    if (audioRef && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setInstructionAudioPlayed(true);
        })
        .catch((error) => {
          console.error("Error playing instruction audio:", error);
          setIsAudioPlaying(false);
          setInstructionAudioPlayed(true);
        });
    }
  }, [currentQuestion, questions, instructionsAdjectiveRef, instructionsNounRef, instructionsMetoхiRef]);

  // Listen for title audio ended, then play instruction audio for first question
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      // Play instruction audio for the first question
      if (currentQuestion === 0 && !instructionAudioPlayed) {
        playInstructionAudio();
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef, currentQuestion, instructionAudioPlayed, playInstructionAudio]);

  // Play instruction audio when question changes (except first question which is handled by title end)
  useEffect(() => {
    if (currentQuestion > 0 && !instructionAudioPlayed) {
      playInstructionAudio();
    }
  }, [currentQuestion, instructionAudioPlayed, playInstructionAudio]);

  // Listen for instruction audio ended
  useEffect(() => {
    const handleInstructionEnded = () => {
      setIsAudioPlaying(false);
    };

    const refs = [instructionsAdjectiveRef, instructionsNounRef, instructionsMetoхiRef];
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.addEventListener("ended", handleInstructionEnded);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.removeEventListener("ended", handleInstructionEnded);
        }
      });
    };
  }, [instructionsAdjectiveRef, instructionsNounRef, instructionsMetoхiRef]);

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
      <audio ref={instructionsAdjectiveRef} src={instructionsAdjectiveSrc} />
      <audio ref={instructionsNounRef} src={instructionsNounSrc} />
      <audio ref={instructionsMetoхiRef} src={instructionsMetoхiSrc} />

      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">
                {questions[currentQuestion].isExample && <span className="example-badge">Παράδειγμα</span>}
                Διαλέγω το κατάλληλο επίθημα και φτιάχνω…
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Visual flow diagram */}
              <div className="mb-4 p-4">
                <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                  {/* Base word in oval */}
                  <div
                    className="px-4 py-3 bg-primary text-white rounded-pill"
                    style={{ fontSize: "1.5rem", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}
                  >
                    {question.baseWord}
                  </div>

                  {/* Arrow with instruction above */}
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2F4F4F", marginBottom: "0.5rem", height: "1.5rem" }}>
                      {question.instruction}
                    </div>
                    <i className="bi bi-arrow-right" style={{ fontSize: "2rem", color: "#2F4F4F" }}></i>
                    <div style={{ height: "1.5rem", marginTop: "0.5rem" }}></div>
                  </div>

                  {/* Result oval - shows result after answer */}
                  <div
                    className={`px-4 py-3 rounded-pill ${
                      selectedAnswer ? (selectedAnswer === question.correct ? "bg-success" : "bg-danger") : "bg-light border border-secondary"
                    } text-white`}
                    style={{ fontSize: "1.5rem", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}
                  >
                    {selectedAnswer ? question.result : "?"}
                  </div>
                </div>
              </div>

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
                        block
                        onClick={() => handleAnswerSelect(option)}
                        disabled={selectedAnswer !== null || isAudioPlaying}
                        variant={variant}
                        style={customStyle}
                        size="lg"
                        className="py-3"
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

export default Game13;
