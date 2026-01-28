// Game 8
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";
import { game8Questions } from "../Data/Game8Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/08/title-instructions.mp3";
import exampleKataponoAudio from "../../assets/sounds/08/example-καταπονώ.mp3";
import exampleDiametroAudio from "../../assets/sounds/08/example-διαμετρώ.mp3";
import anatrepontasAudio from "../../assets/sounds/08/ανατρέποντας.mp3";
import anagennisiAudio from "../../assets/sounds/08/αναγέννηση.mp3";
import antimetopizo from "../../assets/sounds/08/αντιμετωπίζω.mp3";
import katametriAudio from "../../assets/sounds/08/καταμέτρηση.mp3";
import ipovlepondasAudio from "../../assets/sounds/08/υποβλέποντας.mp3";
import iperfortonoAudio from "../../assets/sounds/08/υπερφορτώνω.mp3";
import paratravixaAudio from "../../assets/sounds/08/παρατράβηξα.mp3";
import iperaspizoAudio from "../../assets/sounds/08/υπερασπίζω.mp3";
import kataskopevoAudio from "../../assets/sounds/08/κατασκοπεύω.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

const Game8 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const questions = useMemo(() => game8Questions, []);

  const [gameState, setGameState] = useState("playing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isInitialAudioPlaying, setIsInitialAudioPlaying] = useState(true);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);
  const [wasAnswerSubmitted, setWasAnswerSubmitted] = useState(false);

  // Map words to their audio files
  const wordAudioMap = useMemo(
    () => ({
      καταπονώ: exampleKataponoAudio,
      διαμετρώ: exampleDiametroAudio,
      ανατρέποντας: anatrepontasAudio,
      αναγέννηση: anagennisiAudio,
      καταμέτρηση: katametriAudio,
      αντιμετωπίζω: antimetopizo,
      συγχρονίζω: null,
      συμμαθητής: null,
      συμπολίτης: null,
      υποβλέποντας: ipovlepondasAudio,
      συντρίβοντας: null,
      υπερφορτώνω: iperfortonoAudio,
      παρατράβηξα: paratravixaAudio,
      υπερασπίζω: iperaspizoAudio,
      κατασκοπεύω: kataskopevoAudio,
      υπερφυσικός: null,
      δυσφημίζω: null,
      δυσλειτουργικός: null,
      αντικαπνιστής: null,
    }),
    []
  );

  // Initial title-instructions audio (plays on load)
  const { audioRef: titleAudioRef, audioSrc: titleAudioSrc } = useAudio(titleInstructionsAudio, {
    playOnMount: false,
  });

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  // Word-specific audio (plays after submission for example words)
  const {
    audioRef: wordAudioRef,
    audioSrc: wordAudioSrc,
    play: playWordAudio,
  } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // Play initial audio once on mount
  useEffect(() => {
    if (!hasPlayedInitialAudio && titleAudioRef.current) {
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
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasPlayedInitialAudio, titleAudioRef]);

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
      const currentQ = questions[currentQuestion];
      // Only play practice end audio if this was from an answer submission
      if (wasAnswerSubmitted && currentQ.isExample && currentQuestion < questions.length - 1 && !questions[currentQuestion + 1].isExample) {
        setWaitingForPracticeEnd(true);

        const timer = setTimeout(() => {
          practiceEndAudioRef.current
            .play()
            .then(() => {})
            .catch((error) => {
              console.error("Error playing end of practice audio:", error);
            });
        }, 100);

        return () => clearTimeout(timer);
      }
      setWasAnswerSubmitted(false); // Reset for next time
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef, currentQuestion, questions, practiceEndAudioRef, wasAnswerSubmitted]);

  // Submit game results function
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
      gameName: "GreekMorphologyGame",
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
  }, [studentId, classId, gameResults, schoolId, gameId]);

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
      // Advance to next question after practice end audio finishes
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedChoice(null);
        setQuestionStartTime(null);
        setWasAnswerSubmitted(false);
      } else {
        setGameState("completed");
        submitGameResults();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef, currentQuestion, questions, submitGameResults]);

  const formatMorphemes = (text) => {
    const parts = text.split("|");
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="text-muted mx-1">|</span>}
        <span className="font-weight-bold">{part}</span>
      </React.Fragment>
    ));
  };

  const handleChoiceSelect = (choiceIndex) => {
    if (selectedChoice !== null) return; // Prevent multiple selections

    setSelectedChoice(choiceIndex);
    const isCorrect = choiceIndex === questions[currentQuestion].correct;
    const currentQ = questions[currentQuestion];
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    // Track the result only for non-example questions
    if (!currentQ.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: currentQ.word,
          result: currentQ.choices[choiceIndex],
          target: currentQ.choices[currentQ.correct],
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);

      if (isCorrect) {
        setScore(score + 1);
      }
    }

    // Play word-specific audio if available (for example words)
    const audioFile = wordAudioMap[currentQ.word];
    if (audioFile) {
      setCurrentWordAudio(audioFile);
      setTimeout(() => {
        playWordAudio().catch((error) => {
          console.error("Error playing word audio:", error);
        });
      }, 100);
    }

    // Check if this is the last example
    const isLastExample = currentQ.isExample && currentQuestion < questions.length - 1 && !questions[currentQuestion + 1].isExample;

    if (isLastExample) {
      // Mark that answer was submitted for last example
      setWasAnswerSubmitted(true);
      // Don't auto-advance, wait for practice end audio to finish
    } else {
      // Auto advance after 4 seconds
      setTimeout(() => {
        handleNext();
      }, 4000);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
      setQuestionStartTime(null); // Reset timing for next question
      setWasAnswerSubmitted(false); // Reset for next question
    } else {
      setGameState("completed");
      submitGameResults();
    }
  };

  // Start timing when question loads
  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameState]);

  // Play bravo audio when game is completed
  useEffect(() => {
    if (gameState === "completed") {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameState]);

  if (gameState !== "completed") {
    const currentQ = questions[currentQuestion];

    return (
      <Container fluid className="game-container">
        <audio ref={titleAudioRef} src={titleAudioSrc} />
        <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
        <audio ref={wordAudioRef} src={wordAudioSrc} />
        <Row className="game-row-centered">
          <Col md={12} lg={10}>
            {!questions[currentQuestion].isExample && (
              <QuestionProgressLights
                totalQuestions={questions.filter((q) => !q.isExample).length}
                currentQuestion={questions[currentQuestion].isExample ? -1 : questions.slice(0, currentQuestion).filter((q) => !q.isExample).length}
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
                <h4 className="mb-0 game-title-header">Επίλεξε τη σωστή ανάλυση της λέξης</h4>
              </Card.Header>
              <Card.Body>
                <div className="mb-4 text-center">
                  <div className="display-4 font-weight-bold mb-3">{currentQ.word}</div>
                </div>

                <Row className="mb-4 w-100">
                  {currentQ.choices.map((choice, index) => {
                    let variant = "outline-primary";
                    let customStyle = {};
                    let showIcon = null;

                    if (selectedChoice !== null) {
                      if (index === currentQ.correct) {
                        variant = "success";
                        customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                        showIcon = "✓";
                      } else if (index === selectedChoice) {
                        variant = "danger";
                        showIcon = "✗";
                      }
                    }

                    return (
                      <Col key={index} xs={4} className="mb-3">
                        <Button
                          className="w-100 py-3"
                          variant={variant}
                          style={customStyle}
                          onClick={() => handleChoiceSelect(index)}
                          disabled={selectedChoice !== null || isInitialAudioPlaying || waitingForPracticeEnd}
                        >
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            {formatMorphemes(choice)}
                            {showIcon && (
                              <span className="fs-3" style={{ color: showIcon === "✓" ? "#28a745" : "#dc3545", lineHeight: 1, margin: 0 }}>
                                {showIcon}
                              </span>
                            )}
                          </div>
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
  } else {
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
};

export default Game8;
