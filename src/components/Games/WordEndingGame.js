import React, {
  useState,
  useEffect,
  // useRef
} from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";

const WordEndingGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  // Game state
  const [currentRound, setCurrentRound] = useState(0); // 0 = slow, 1 = normal
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  // const audioRef = useRef(null);

  const questions = React.useMemo(
    () => [
      {
        stem: "καλ",
        correctSuffix: "ος",
        word: "καλός",
        options: ["ος", "ή", "ό"],
        /* audioSlow: require("../../assets/sounds/game4/word1-slow.mp3"),
        audioNormal: require("../../assets/sounds/game4/word1.mp3"), */
        isExample: true,
      },
      {
        stem: "τοπ",
        correctSuffix: "ικός",
        word: "τοπικός",
        options: ["ιμός", "ικός", "ώνω"],
      },
      {
        stem: "γυάλ",
        correctSuffix: "ινος",
        word: "γυάλινος",
        options: ["ιμος", "ινος", "ικος"],
      },
      {
        stem: "χρωματ",
        correctSuffix: "ικός",
        word: "χρωματικός",
        options: ["ικός", "ιμός", "ώνω"],
      },
      {
        stem: "μουσ",
        correctSuffix: "ική",
        word: "μουσική",
        options: ["ική", "ιμή", "ωμένη"],
      },
    ],
    []
  );

  // Play audio automatically when question changes
  const playAudio = React.useCallback(
    (slow = false) => {
      // Console log for audio file identification
      console.log(4, currentQuestion + 1, slow ? "slow" : "fast");

      // if (audioRef.current) {
      //   audioRef.current.pause();
      //   audioRef.current.currentTime = 0;
      // }

      // const audioFile = slow
      //   ? questions[currentQuestion].audioSlow
      //   : questions[currentQuestion].audioNormal;
      // audioRef.current = new Audio(audioFile);

      // audioRef.current
      //   .play()
      //   .then(() => {
      setIsPlaying(true);

      // Start timing when audio plays (or when question starts)
      if (!questionStartTime) {
        setQuestionStartTime(Date.now());
      }

      const timeoutId = setTimeout(() => setIsPlaying(false), 1000); // Simulate audio duration
      return () => clearTimeout(timeoutId);
      //   })
      //   .catch((error) => {
      //     console.error("Audio playback failed:", error);
      //     setIsPlaying(false);
      //   });
    },
    [
      //questions,
      currentQuestion,
      questionStartTime,
    ]
  );

  useEffect(() => {
    if (!gameCompleted) {
      playAudio(currentRound === 0); // Slow for first round, normal for second
    }
  }, [currentQuestion, currentRound, gameCompleted, playAudio]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correctSuffix;
    const currentQ = questions[currentQuestion];
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime
      ? Math.round((questionEndTime - questionStartTime) / 1000)
      : 0;

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

    // Auto advance after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 1000);
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
        results: JSON.stringify(results)
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
          <Card.Header className="text-center bg-success text-white">
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={questions.filter((q) => !q.isExample).length * 2}
              answeredQuestions={gameResults
                .filter((r) => !r.isExample)
                .map((r) => r.isCorrect)}
            />
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/")}
              className="mt-4"
            >
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
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length * 2}
              currentQuestion={
                currentRound * questions.filter((q) => !q.isExample).length +
                (currentQuestion - 1)
              }
              answeredQuestions={gameResults
                .filter(
                  (r) => !questions.find((q) => q.word === r.word)?.isExample
                )
                .map((r) => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header
              className={`text-center ${
                questions[currentQuestion].isExample
                  ? "bg-warning text-dark"
                  : "bg-primary text-white"
              }`}
            >
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && (
                  <span className="badge badge-dark me-2">Παράδειγμα</span>
                )}
                Διάλεξε τη σωστή κατάληξη
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-4"></div>

              <div className="p-4 bg-light rounded mb-4">
                <div className="display-4 font-weight-bold mb-3">
                  {currentQ.stem}
                  {selectedAnswer || "_______"}
                </div>

                <Button
                  variant={isPlaying ? "secondary" : "primary"}
                  onClick={() => playAudio(currentRound === 0)}
                  disabled={isPlaying}
                  className="mb-3"
                >
                  {isPlaying ? "Αναπαραγωγή..." : "Ακούστε τη λέξη"}
                </Button>
              </div>

              <Row className="g-3 mb-4">
                {currentQ.options.map((option, index) => (
                  <Col key={index} xs={4}>
                    <Button
                      variant={
                        selectedAnswer === option
                          ? option === currentQ.correctSuffix
                            ? "success"
                            : "danger"
                          : selectedAnswer && option === currentQ.correctSuffix
                          ? "success"
                          : "outline-primary"
                      }
                      onClick={() => handleAnswerSelect(option)}
                      disabled={selectedAnswer !== null}
                      className="w-100 py-3"
                    >
                      {option}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WordEndingGame;
