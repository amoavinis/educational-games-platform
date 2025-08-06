import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import "../../styles/Game.css";
import { addReport } from "../../services/reports";

const GreekMorphologyGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const questions = [
    {
      word: "λόγος",
      choices: ["λόγ|ος", "λό|γος", "λογ|ος"],
      correct: 0,
      isExample: true,
    },
    {
      word: "καταπονώ",
      choices: ["κατ|απον|ώ", "κατα|πον|ώ", "κα|ταπο|νώ"],
      correct: 1,
    },
    {
      word: "ανατρέποντας",
      choices: ["ανα|τρέπ|οντας", "α|νατρε|ποντας", "ανα|τρέπο|ντας"],
      correct: 0,
    },
    {
      word: "παραγωγικός",
      choices: ["παρα|γωγ|ικός", "πα|ραγω|γικός", "παραγω|γι|κός"],
      correct: 0,
    },
    {
      word: "διασκεδάζω",
      choices: ["δια|σκεδάζ|ω", "δι|ασκε|δάζω", "δια|σκεδ|άζω"],
      correct: 0,
    },
    {
      word: "επανάληψη",
      choices: ["επα|νάλη|ψη", "επαν|άλη|ψη", "επ|αναλ|ηψη"],
      correct: 1,
    },
    {
      word: "υπερβολικός",
      choices: ["υπερ|βολ|ικός", "υπε|ρβο|λικός", "υπερβο|λι|κός"],
      correct: 0,
    },
    {
      word: "αντιμετωπίζω",
      choices: ["αντι|μετωπ|ίζω", "αντ|ιμετω|πίζω", "αντιμε|τωπ|ίζω"],
      correct: 0,
    },
    {
      word: "προσαρμόζω",
      choices: ["προσ|αρμόζ|ω", "προσαρ|μόζ|ω", "προσ|αρμ|όζω"],
      correct: 0,
    },
  ];


  const [gameState, setGameState] = useState("playing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

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
    const secondsForQuestion = questionStartTime ? Math.round((questionEndTime - questionStartTime) / 1000) : 0;

    // Track the result only for non-example questions
    if (!currentQ.isExample) {
      setGameResults((prev) => [
        ...prev,
        {
          question: currentQ.word,
          result: currentQ.choices[choiceIndex],
          target: currentQ.choices[currentQ.correct],
          isCorrect: isCorrect,
          seconds: secondsForQuestion
        },
      ]);

      if (isCorrect) {
        setScore(score + 1);
      }
    }

    // Auto advance after 1 second
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
      setQuestionStartTime(null); // Reset timing for next question
    } else {
      setGameState("completed");
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
    const datetime = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' + 
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0');
    
    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "GreekMorphologyGame",
      questions: gameResults
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

  // Start timing when question loads
  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameState]);

  if (gameState !== "completed") {
    const currentQ = questions[currentQuestion];

    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={
                questions[currentQuestion].isExample
                  ? -1
                  : questions
                      .slice(0, currentQuestion)
                      .filter((q) => !q.isExample).length
              }
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
            <Card className="main-card">
              <Card.Header
                className={`text-center ${
                  questions[currentQuestion].isExample
                    ? "bg-warning"
                    : "bg-primary"
                } text-white`}
              >
                <h4 className="mb-0">
                  Διάλεξε τη σωστή απάντηση
                  {questions[currentQuestion].isExample && (
                    <span className="badge bg-dark ms-2">Παράδειγμα</span>
                  )}
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="mb-4 text-center">
                  <div className="display-4 font-weight-bold mb-3">
                    {currentQ.word}
                  </div>
                  <p className="text-muted">
                    Επίλεξε τη σωστή μορφολογική ανάλυση
                  </p>
                </div>

                <Row className="mb-4 w-100">
                  {currentQ.choices.map((choice, index) => {
                    let variant = "outline-primary";
                    if (selectedChoice !== null) {
                      if (index === currentQ.correct) {
                        variant = "success";
                      } else if (index === selectedChoice) {
                        variant = "danger";
                      }
                    }

                    return (
                      <Col key={index} xs={4} className="mb-3">
                        <Button
                          className="w-100 py-3"
                          variant={variant}
                          onClick={() => handleChoiceSelect(index)}
                          disabled={selectedChoice !== null}
                        >
                          <div className="d-flex align-items-center justify-content-center">
                            {formatMorphemes(choice)}
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
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={questions.filter((q) => !q.isExample).length}
              currentQuestion={questions.filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
            <Card className="main-card">
              <Card.Header className="text-center bg-success text-white">
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
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
          </Col>
        </Row>
      </Container>
    );
  }
};

export default GreekMorphologyGame;
