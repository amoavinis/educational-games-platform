// Game 12
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game12Questions } from "../Data/Game12Data";
import useAudio from "../../hooks/useAudio";
import titleAudio from "../../assets/sounds/12/title.mp3";
import instructionsAudio from "../../assets/sounds/12/instructions.mp3";
// Word audio imports
import exampleMariaAudio from "../../assets/sounds/12/example-Μαρία χτενιζόταν.mp3";
import examplePaidiaAudio from "../../assets/sounds/12/example-παιδιά έπαιξαν.mp3";
import grafoumeAudio from "../../assets/sounds/12/γράφουμε.mp3";
import chatikateAudio from "../../assets/sounds/12/χαθήκατε.mp3";
import fagameAudio from "../../assets/sounds/12/φάγαμε.mp3";
import gennithikeAudio from "../../assets/sounds/12/γεννήθηκε.mp3";
import kryfikaAudio from "../../assets/sounds/12/κρύφτηκα.mp3";
import gemiseAudio from "../../assets/sounds/12/γέμισε.mp3";
import pantrefikaAudio from "../../assets/sounds/12/παντρευτήκατε.mp3";
import plirothikanAudio from "../../assets/sounds/12/πληρώθηκαν.mp3";
import elegchthikanAudio from "../../assets/sounds/12/ελέγχθηκαν.mp3";
import bariomounAudio from "../../assets/sounds/12/βαριόμουν.mp3";
import archizeiAudio from "../../assets/sounds/12/αρχίζει.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

const Game12 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);

  const questions = useMemo(() => game12Questions, []);

  // Map question indices to their audio files
  const questionAudioMap = useMemo(
    () => ({
      1: exampleMariaAudio,  // Η Μαρία χτενιζόταν
      2: examplePaidiaAudio, // παιδιά έπαιξαν
      3: grafoumeAudio,      // γράφουμε
      4: chatikateAudio,     // χαθήκατε
      5: fagameAudio,        // φάγαμε
      6: gennithikeAudio,    // γεννήθηκε
      7: kryfikaAudio,       // κρύφτηκα
      8: gemiseAudio,        // γέμισε
      9: pantrefikaAudio,    // παντρευτήκατε
      10: plirothikanAudio,  // πληρώθηκαν
      11: elegchthikanAudio, // ελέγχθηκαν
      12: bariomounAudio,    // βαριόμουν
      13: archizeiAudio,     // αρχίζει
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

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null || isAudioPlaying) return; // Prevent multiple selections and block during initial audio

    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    setSelectedAnswer(answer);

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

    // Play word audio if available for this question
    const audioFile = questionAudioMap[currentQuestion];
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play().catch((error) => {
        console.error("Error playing word audio:", error);
      });
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
    } else {
      setGameState("results");
      submitGameResults();
    }
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
      gameName: "GreekVerbEndingGame",
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

  // Listen for title audio ended, then play instructions
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      // Play instructions audio
      if (instructionsAudioRef.current) {
        instructionsAudioRef.current
          .play()
          .catch((error) => {
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

  // Start timing when question loads
  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameState]);

  // Play bravo audio when game results are shown
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
        <Row className="justify-content-center">
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
      <Row className="justify-content-center">
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
                Διαλέγω το σωστό κλιτικό επίθημα
              </h4>
            </Card.Header>
            <Card.Body>
              <Card className="mb-4 border-primary">
                <Card.Body className="text-center">
                  <h3 className="display-5 mb-4 text-primary">
                    {selectedAnswer ? question.sentence.replace(/_{2,}/, selectedAnswer.slice(1)) : question.sentence}
                  </h3>
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

      {/* Hidden audio elements */}
      <audio ref={titleAudioRef} src={titleAudioSrc} />
      <audio ref={instructionsAudioRef} src={instructionsAudioSrc} />
    </Container>
  );
};

export default Game12;
