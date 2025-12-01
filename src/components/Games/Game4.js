// Game 4
import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game4Questions } from "../Data/Game4Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/04/title-instructions.mp3";

// Import word audio files
import agapimenosAudio from "../../assets/sounds/04/αγαπημένος.mp3";
import agnotitaAudio from "../../assets/sounds/04/αγνότητα.mp3";
import gnisiotitaAudio from "../../assets/sounds/04/γνησιότητα.mp3";
import dikaiosyniAudio from "../../assets/sounds/04/δικαιοσύνη.mp3";
import egkymosyniAudio from "../../assets/sounds/04/εγκυμοσύνη.mp3";
import kalosyniAudio from "../../assets/sounds/04/καλοσύνη.mp3";
import kleidomenosAudio from "../../assets/sounds/04/κλειδωμένος.mp3";
import kourastikosAudio from "../../assets/sounds/04/κουραστικός.mp3";
import paragogikosAudio from "../../assets/sounds/04/παραγωγικός.mp3";
import semnotitaAudio from "../../assets/sounds/04/σεμνότητα.mp3";
import skalistosAudio from "../../assets/sounds/04/σκαλιστός.mp3";
import sxoleioAudio from "../../assets/sounds/04/σχολείο.mp3";
import fortismenosAudio from "../../assets/sounds/04/φορτισμένος.mp3";
import fortomenosAudio from "../../assets/sounds/04/φορτωμένος.mp3";
import xorismenosAudio from "../../assets/sounds/04/χωρισμένος.mp3";
import xoristosAudio from "../../assets/sounds/04/χωριστός.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

// Import example audio files
import exampleGrafikosAudio from "../../assets/sounds/04/example-γραφικός.mp3";
import exampleDynatotitaAudio from "../../assets/sounds/04/example-δυνατότητα.mp3";
import exampleKoureioAudio from "../../assets/sounds/04/example-κουρείο.mp3";

const Game4 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();

  // Map words to their audio files
  const wordAudioMap = React.useMemo(
    () => ({
      δυνατότητα: exampleDynatotitaAudio,
      κουρείο: exampleKoureioAudio,
      γραφικός: exampleGrafikosAudio,
      κουραστικός: kourastikosAudio,
      παραγωγικός: paragogikosAudio,
      σκαλιστός: skalistosAudio,
      χωριστός: xoristosAudio,
      φαρμακείο: null, // No audio file
      σχολείο: sxoleioAudio,
      φορτισμένος: fortismenosAudio,
      χωρισμένος: xorismenosAudio,
      αγαπημένος: agapimenosAudio,
      φορτωμένος: fortomenosAudio,
      κλειδωμένος: kleidomenosAudio,
      αγνότητα: agnotitaAudio,
      σεμνότητα: semnotitaAudio,
      γνησιότητα: gnisiotitaAudio,
      δικαιοσύνη: dikaiosyniAudio,
      καλοσύνη: kalosyniAudio,
      εγκυμοσύνη: egkymosyniAudio,
    }),
    []
  );

  // Game state
  const [currentRound, setCurrentRound] = useState(0); // 0 = slow, 1 = normal
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isInitialAudioPlaying, setIsInitialAudioPlaying] = useState(false);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);

  // Initial title-instructions audio
  const { audioRef: titleAudioRef } = useAudio(titleInstructionsAudio, {
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
      setIsInitialAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [titleAudioRef]);

  // Play title-instructions audio on mount
  useEffect(() => {
    if (!hasPlayedInitialAudio && titleAudioRef.current) {
      setIsInitialAudioPlaying(true);
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
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasPlayedInitialAudio, titleAudioRef]);

  const questions = React.useMemo(() => {
    // Separate example questions from regular questions
    const examples = game4Questions.filter((q) => q.isExample);
    const regularQuestions = game4Questions.filter((q) => !q.isExample);

    // Shuffle regular questions using Fisher-Yates algorithm
    const shuffled = [...regularQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return examples first, then shuffled questions
    return [...examples, ...shuffled];
  }, []);

  // Function to play current word audio
  const playWordAudio = React.useCallback(() => {
    if (questions[currentQuestion]) {
      const word = questions[currentQuestion].word;
      const audioFile = wordAudioMap[word];

      if (audioFile) {
        setCurrentWordAudio(audioFile);

        // Wait for React to update the audio element, then play
        setTimeout(() => {
          if (wordAudioRef.current) {
            wordAudioRef.current.play().catch((error) => {
              console.error("Error playing word audio:", error);
            });
          }
        }, 150);
      }
    }
  }, [currentQuestion, questions, wordAudioMap, wordAudioRef]);

  // Start question timer when question changes (but don't play audio)
  useEffect(() => {
    if (!gameCompleted && !isInitialAudioPlaying && !questionStartTime) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameCompleted, isInitialAudioPlaying, questionStartTime]);

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
    if (selectedAnswer !== null || isInitialAudioPlaying) return; // Prevent multiple selections and block during initial audio

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctSuffix;
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
          target: currentQ.correctSuffix,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Play word audio after selection
    playWordAudio();

    // Auto advance after 4 seconds
    setTimeout(() => {
      nextQuestion();
    }, 4000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else if (currentRound === 0) {
      // Move to normal speed round, skip example question
      setCurrentRound(1);
      setCurrentQuestion(1); // Start at question 1 to skip example
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameCompleted(true);
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
      gameName: "WordEndingGame",
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

  if (gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={questions.filter((q) => !q.isExample).length * 2}
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
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={
                currentRound * questions.filter((q) => !q.isExample).length + questions.slice(0, currentQuestion).filter((q) => !q.isExample).length
              }
              answeredQuestions={gameResults.filter((r) => !questions.find((q) => q.word === r.word)?.isExample).map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">
                {questions[currentQuestion].isExample && <span className="example-badge">Παράδειγμα</span>}
                Ακούω και διαλέγω το σωστό επίθημα
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-4"></div>

              <div className="p-4 bg-light rounded mb-4">
                <div className="display-4 font-weight-bold mb-3">
                  {currentQ.stem}
                  {selectedAnswer ? currentQ.correctSuffix : "_______"}
                </div>

                <div className="d-flex justify-content-center">
                  <Button
                    variant="light"
                    onClick={playWordAudio}
                    disabled={isInitialAudioPlaying}
                    className="mb-3 rounded-circle"
                    style={{
                      width: "80px",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      border: "2px solid #6c757d",
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

                  if (selectedAnswer === option) {
                    if (option === currentQ.correctSuffix) {
                      variant = "success";
                      customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
                    } else {
                      variant = "danger";
                      customStyle = { backgroundColor: "#9370DB", borderColor: "#9370DB", color: "white" };
                    }
                  } else if (selectedAnswer && option === currentQ.correctSuffix) {
                    variant = "success";
                    customStyle = { backgroundColor: "#FFFF33", borderColor: "#FFFF33", color: "black" };
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
                        <div className="d-flex align-items-center justify-content-center">
                          {selectedAnswer !== null && (
                            <span className="me-2" style={{ fontSize: "1.5rem" }}>
                              {option === currentQ.correctSuffix ? "✓" : "✗"}
                            </span>
                          )}
                          <span>{option}</span>
                        </div>
                      </Button>
                    </Col>
                  );
                })}
              </Row>
              <audio ref={titleAudioRef} src={titleInstructionsAudio} />
              <audio ref={wordAudioRef} src={currentWordAudio} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game4;
