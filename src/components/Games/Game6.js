// Game 6
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game6Questions } from "../Data/Game6Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/06/title-instructions.mp3";
import exampleAntigrafoAudio from "../../assets/sounds/06/example-αντιγραφω.mp3";
import exampleDiatrechoAudio from "../../assets/sounds/06/example-διατρεχω.mp3";
import exampleYpografoAudio from "../../assets/sounds/06/example-υπογραφω.mp3";
import antibaroAudio from "../../assets/sounds/06/αντιβαρο.mp3";
import antidrasiAudio from "../../assets/sounds/06/αντιδραση.mp3";
import antidoroAudio from "../../assets/sounds/06/αντιδωρο.mp3";
import antilaloAudio from "../../assets/sounds/06/αντιλαλος.mp3";
import antipathoAudio from "../../assets/sounds/06/αντιπαθω.mp3";
import antiparoxiAudio from "../../assets/sounds/06/αντιπαροχη.mp3";
import antistoixizoAudio from "../../assets/sounds/06/αντιστοιχιζω.mp3";
import apogeiosiAudio from "../../assets/sounds/06/απογειωση.mp3";
import apotrixonoAudio from "../../assets/sounds/06/αποτριχωνω.mp3";
import apofoitoAudio from "../../assets/sounds/06/αποφοιτω.mp3";
import apoxorisiAudio from "../../assets/sounds/06/αποχωρηση.mp3";
import diaballoAudio from "../../assets/sounds/06/διαβαλλω.mp3";
import diadromoAudio from "../../assets/sounds/06/διαδρομος.mp3";
import dialyoAudio from "../../assets/sounds/06/διαλυω.mp3";
import diaprepoAudio from "../../assets/sounds/06/διαπρεπω.mp3";
import dyskinitosAudio from "../../assets/sounds/06/δυσκινητος.mp3";
import dystyxiaAudio from "../../assets/sounds/06/δυστυχια.mp3";
import dysfimisiAudio from "../../assets/sounds/06/δυσφημιση.mp3";
import yperkoposiAudio from "../../assets/sounds/06/υπερκοπωση.mp3";
import yperogkoAudio from "../../assets/sounds/06/υπερογκος.mp3";
import yperpidoAudio from "../../assets/sounds/06/υπερπηδω.mp3";
import yperfysikosAudio from "../../assets/sounds/06/υπερφυσικος.mp3";
import ypodouloAudio from "../../assets/sounds/06/υποδουλος.mp3";
import ypostratigoAudio from "../../assets/sounds/06/υποστρατηγος.mp3";
import ypotropiAudio from "../../assets/sounds/06/υποτροπη.mp3";
import ypoxreosiAudio from "../../assets/sounds/06/υποχρεωση.mp3";
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
      διατρεχω: exampleDiatrechoAudio,
      υπογραφω: exampleYpografoAudio,
      αντιγραφω: exampleAntigrafoAudio,
      υποδουλος: ypodouloAudio,
      υποτροπη: ypotropiAudio,
      υποχρεωση: ypoxreosiAudio,
      υποστρατηγος: ypostratigoAudio,
      αντιδραση: antidrasiAudio,
      αντιλαλος: antilaloAudio,
      αντιδωρο: antidoroAudio,
      αντιπαθω: antipathoAudio,
      υπερκοπωση: yperkoposiAudio,
      υπερογκος: yperogkoAudio,
      υπερφυσικος: yperfysikosAudio,
      υπερπηδω: yperpidoAudio,
      διαβαλλω: diaballoAudio,
      διαπρεπω: diaprepoAudio,
      διαλυω: dialyoAudio,
      διαδρομος: diadromoAudio,
      αποτριχωνω: apotrixonoAudio,
      αποφοιτω: apofoitoAudio,
      αποχωρηση: apoxorisiAudio,
      απογειωση: apogeiosiAudio,
      δυσκινητος: dyskinitosAudio,
      δυστυχια: dystyxiaAudio,
      δυσφημιση: dysfimisiAudio,
      αντιπαροχη: antiparoxiAudio,
      αντιστοιχιζω: antistoixizoAudio,
      αντιβαρο: antibaroAudio,
    }),
    []
  );

  // Initial title-instructions audio (plays on load)
  const { audioRef: titleAudioRef, audioSrc: titleAudioSrc } = useAudio(titleInstructionsAudio, {
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
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef]);

  // Function to play word audio (for audio button)
  const playAudio = useCallback(() => {
    const currentQ = questions[currentQuestion];
    // Remove accents from word for audio lookup
    const wordWithoutAccents = currentQ.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const audioFile = wordAudioMap[wordWithoutAccents];
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

    // Play word-specific audio if available
    // Remove accents from word for audio lookup
    const wordWithoutAccents = currentQ.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const audioFile = wordAudioMap[wordWithoutAccents];
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

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 3000);
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
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.filter((r) => !r.isExample).map((r) => r.isCorrect)}
            />
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
      <audio ref={wordAudioRef} src={wordAudioSrc} />
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
                Ακούω και διαλέγω το σωστό πρόθημα
              </h4>
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
                    disabled={isInitialAudioPlaying || isWordAudioPlaying || selectedAnswer !== null}
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

              <Row className="g-3 mb-4">
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
                        disabled={selectedAnswer !== null || isInitialAudioPlaying}
                        className="w-100 py-3"
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

export default WordPrefixGame;
