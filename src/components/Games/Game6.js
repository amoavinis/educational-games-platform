// Game 6
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game6Questions } from "../Data/Game6Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/06/title-instructions.mp3";
import exampleAntigrafoAudio from "../../assets/sounds/06/example-αντιγράφω.mp3";
import exampleDiatrechoAudio from "../../assets/sounds/06/example-διατρέχω.mp3";
import exampleYpografoAudio from "../../assets/sounds/06/example-υπογράφω.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

import antibaroAudio from "../../assets/sounds/06/αντίβαρο.mp3";
import antidrasiAudio from "../../assets/sounds/06/αντίδραση.mp3";
import antidoroAudio from "../../assets/sounds/06/αντίδωρο.mp3";
import antilaloAudio from "../../assets/sounds/06/αντίλαλος.mp3";
import antipathoAudio from "../../assets/sounds/06/αντιπαθώ.mp3";
import antiparoxiAudio from "../../assets/sounds/06/αντιπαροχή.mp3";
import antistoixizoAudio from "../../assets/sounds/06/αντιστοιχίζω.mp3";
import apogeiosiAudio from "../../assets/sounds/06/απογείωση.mp3";
import apotrixonoAudio from "../../assets/sounds/06/αποτριχώνω.mp3";
import apofoitoAudio from "../../assets/sounds/06/αποφοιτώ.mp3";
import apoxorisiAudio from "../../assets/sounds/06/αποχώρηση.mp3";
import diaballoAudio from "../../assets/sounds/06/διαβάλλω.mp3";
import diadromoAudio from "../../assets/sounds/06/διάδρομος.mp3";
import dialyoAudio from "../../assets/sounds/06/διαλύω.mp3";
import diaprepoAudio from "../../assets/sounds/06/διαπρέπω.mp3";
import dyskinitosAudio from "../../assets/sounds/06/δυσκίνητος.mp3";
import dystyxiaAudio from "../../assets/sounds/06/δυστυχία.mp3";
import dysfimisiAudio from "../../assets/sounds/06/δυσφήμιση.mp3";
import yperkoposiAudio from "../../assets/sounds/06/υπερκόπωση.mp3";
import yperogkoAudio from "../../assets/sounds/06/υπέρογκος.mp3";
import yperpidoAudio from "../../assets/sounds/06/υπερπηδώ.mp3";
import yperfysikosAudio from "../../assets/sounds/06/υπερφυσικός.mp3";
import ypodouloAudio from "../../assets/sounds/06/υπόδουλος.mp3";
import ypostratigoAudio from "../../assets/sounds/06/υποστράτηγος.mp3";
import ypotropiAudio from "../../assets/sounds/06/υποτροπή.mp3";
import ypoxreosiAudio from "../../assets/sounds/06/υποχρέωση.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

const WordPrefixGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isInitialAudioPlaying, setIsInitialAudioPlaying] = useState(true);
  const [isWordAudioPlaying, setIsWordAudioPlaying] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);
  const [wasAnswerSubmitted, setWasAnswerSubmitted] = useState(false);

  const questions = useMemo(() => {
    const examples = game6Questions.filter((q) => q.isExample);
    const nonExamples = game6Questions.filter((q) => !q.isExample);

    // Shuffle non-examples using Fisher-Yates algorithm
    const shuffled = [...nonExamples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return [...examples, ...shuffled];
  }, []);

  // Map words to their audio files (remove accents for matching)
  const wordAudioMap = useMemo(
    () => ({
      διατρέχω: exampleDiatrechoAudio,
      υπογράφω: exampleYpografoAudio,
      αντιγράφω: exampleAntigrafoAudio,
      υπόδουλος: ypodouloAudio,
      υποτροπή: ypotropiAudio,
      υποχρέωση: ypoxreosiAudio,
      υποστράτηγος: ypostratigoAudio,
      αντίδραση: antidrasiAudio,
      αντίλαλος: antilaloAudio,
      αντίδωρο: antidoroAudio,
      αντιπαθώ: antipathoAudio,
      υπερκόπωση: yperkoposiAudio,
      υπέρογκος: yperogkoAudio,
      υπερφυσικός: yperfysikosAudio,
      υπερπηδώ: yperpidoAudio,
      διαβάλλω: diaballoAudio,
      διαπρέπω: diaprepoAudio,
      διαλύω: dialyoAudio,
      διάδρομος: diadromoAudio,
      αποτριχώνω: apotrixonoAudio,
      αποφοιτώ: apofoitoAudio,
      αποχώρηση: apoxorisiAudio,
      απογείωση: apogeiosiAudio,
      δυσκίνητος: dyskinitosAudio,
      δυστυχία: dystyxiaAudio,
      δυσφήμιση: dysfimisiAudio,
      αντιπαροχή: antiparoxiAudio,
      αντιστοιχίζω: antistoixizoAudio,
      αντίβαρο: antibaroAudio,
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

  // Word-specific audio (plays after submission for example words and on audio button press)
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
      if (!questionStartTime) {
        setQuestionStartTime(Date.now());
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef, questionStartTime]);

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      setIsWordAudioPlaying(false);
      const currentQ = questions[currentQuestion];
      // Only play practice end audio if this was from an answer submission (not from sound button)
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

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef]);

  // Auto-play word audio when question changes (after initial audio ends)
  useEffect(() => {
    if (!isInitialAudioPlaying && selectedAnswer === null && !isWordAudioPlaying) {
      const currentQ = questions[currentQuestion];
      const audioFile = wordAudioMap[currentQ.word];
      if (audioFile) {
        setCurrentWordAudio(audioFile);
        setIsWordAudioPlaying(true);
        setTimeout(() => {
          playWordAudio().catch((error) => {
            console.error("Error playing word audio:", error);
            setIsWordAudioPlaying(false);
          });
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, isInitialAudioPlaying, selectedAnswer]);

  // Function to play word audio (for audio button)
  const playAudio = useCallback(() => {
    const currentQ = questions[currentQuestion];
    const audioFile = wordAudioMap[currentQ.word];
    if (audioFile) {
      setCurrentWordAudio(audioFile);
      setIsWordAudioPlaying(true);
      setTimeout(() => {
        playWordAudio().catch((error) => {
          console.error("Error playing word audio:", error);
          setIsWordAudioPlaying(false);
        });
      }, 100);
    }
  }, [currentQuestion, questions, wordAudioMap, playWordAudio]);

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameCompleted) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctPrefix;
    const currentQ = questions[currentQuestion];
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    // Track the result only for non-example questions
    if (!currentQ.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: currentQ.word,
          result: answer,
          target: currentQ.correctPrefix,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Check if this is the last example and should play end-of-practice audio
    const isLastExample = currentQ.isExample && currentQuestion < questions.length - 1 && !questions[currentQuestion + 1].isExample;

    if (isLastExample) {
      // If word audio is not currently playing, play end-of-practice immediately
      if (!isWordAudioPlaying) {
        setWaitingForPracticeEnd(true);
        setTimeout(() => {
          practiceEndAudioRef.current
            .play()
            .then(() => {})
            .catch((error) => {
              console.error("Error playing end of practice audio:", error);
              setWaitingForPracticeEnd(false);
            });
        }, 100);
      } else {
        // Word audio is still playing, mark to play end-of-practice when it ends
        setWasAnswerSubmitted(true);
      }
    }

    // Auto advance after 4 seconds
    setTimeout(() => {
      nextQuestion();
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
      gameName: "PrefixMatchingGame",
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

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameCompleted(true);
      submitGameResults();
    }
  };

  if (gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <QuestionProgressLights
          totalQuestions={questions.filter((q) => !q.isExample).length}
          currentQuestion={questions.filter((q) => !q.isExample).length}
          answeredQuestions={gameResults.filter((r) => !r.isExample).map((r) => r.isCorrect)}
        />
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
              Τέλος Άσκησης
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

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
              <h4 className="mb-0 game-title-header">Ακούω και διαλέγω το σωστό πρόθημα</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="p-4 bg-light rounded mb-4">
                <div className="display-4 font-weight-bold mb-3">
                  {selectedAnswer ? currentQ.correctPrefix : "_____"}
                  {currentQ.stem}
                </div>

                <div className="d-flex justify-content-center">
                  <Button
                    variant="light"
                    onClick={playAudio}
                    disabled={isInitialAudioPlaying || isWordAudioPlaying || selectedAnswer !== null || waitingForPracticeEnd}
                    className="mb-3 rounded-circle"
                    style={{
                      width: "80px",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      border: "2px solid #6c757d",
                      opacity: isInitialAudioPlaying || isWordAudioPlaying || selectedAnswer !== null ? 0.6 : 1,
                    }}
                  >
                    <i className="bi bi-volume-up" style={{ fontSize: "30px", color: "#6c757d" }}></i>
                  </Button>
                </div>
              </div>

              <Row className="g-3 mb-4 align-items-center">
                {currentQ.options.map((option, index) => {
                  let variant = "outline-primary";
                  let customStyle = {};
                  let showIcon = null;

                  if (selectedAnswer === option) {
                    if (option === currentQ.correctPrefix) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                      showIcon = "✓";
                    } else {
                      variant = "danger";
                      customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                      showIcon = "✗";
                    }
                  } else if (selectedAnswer && option === currentQ.correctPrefix) {
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
                        disabled={selectedAnswer !== null || isInitialAudioPlaying || waitingForPracticeEnd}
                        className="w-100 py-3"
                      >
                        {option}
                        {showIcon && <span style={{'margin-left': 10}}>{showIcon}</span>}
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

export default WordPrefixGame;
