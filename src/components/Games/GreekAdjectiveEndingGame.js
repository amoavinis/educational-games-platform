import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import QuestionProgressLights from '../QuestionProgressLights';
import "../../styles/Game.css";
import { addReport } from "../../services/reports";

const GreekAdjectiveEndingGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const questions = [
    {
      sentence: "Αυτό το παιδί είναι καλ______.",
      type: "επίθετο",
      options: ["-ό", "-ή", "-ός"],
      correct: "-ό",
      explanation:
        'Το επίθετο "καλό" στο ουδέτερο γένος παίρνει την κατάληξη -ό',
      isExample: true,
    },
    {
      sentence: "Αυτός ο άνθρωπος είναι κουραστ ______.",
      type: "επίθετο",
      options: ["-ική", "-ηκαμε", "-ικός"],
      correct: "-ικός",
      explanation:
        'Το επίθετο "κουραστικός" στο αρσενικό γένος παίρνει την κατάληξη -ικός',
    },
    {
      sentence: "Η πόρτα είναι κλειδ_____",
      type: "παθητική μετοχή",
      options: ["-ωμα", "-ωμένη", "-ώνω"],
      correct: "-ωμένη",
      explanation:
        'Η παθητική μετοχή "κλειδωμένη" στο θηλυκό γένος παίρνει την κατάληξη -ωμένη',
    },
    {
      sentence: "Το παιδί είναι χαρούμεν_____",
      type: "επίθετο",
      options: ["-ο", "-η", "-ος"],
      correct: "-ο",
      explanation:
        'Το επίθετο "χαρούμενο" στο ουδέτερο γένος παίρνει την κατάληξη -ο',
    },
    {
      sentence: "Τα τραγούδια είναι γνωστ_____",
      type: "επίθετο",
      options: ["-ά", "-ές", "-οί"],
      correct: "-ά",
      explanation:
        'Το επίθετο "γνωστά" στο ουδέτερο πληθυντικό παίρνει την κατάληξη -ά',
    },
    {
      sentence: "Οι μαθητές είναι προετοιμασμέν_____",
      context: "Αρσενικό γένος, πληθυντικός αριθμός, παθητική μετοχή",
      type: "παθητική μετοχή",
      options: ["-οι", "-ες", "-α"],
      correct: "-οι",
      explanation:
        'Η παθητική μετοχή "προετοιμασμένοι" στον αρσενικό πληθυντικό παίρνει την κατάληξη -οι',
    },
    {
      sentence: "Η γάτα είναι κουρασμέν_____",
      context: "Θηλυκό γένος, ενικός αριθμός, παθητική μετοχή",
      type: "παθητική μετοχή",
      options: ["-η", "-ο", "-ος"],
      correct: "-η",
      explanation:
        'Η παθητική μετοχή "κουρασμένη" στο θηλυκό γένος παίρνει την κατάληξη -η',
    },
  ];

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? Math.round((questionEndTime - questionStartTime) / 1000) : 0;

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
          seconds: secondsForQuestion
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
    const datetime = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' + 
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0');
    
    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "GreekAdjectiveEndingGame",
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
      console.log("Game results submitted successfully");
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

  const question = questions[currentQuestion];

  if (gameState === "results") {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={questions.filter(q => !q.isExample).length}
              currentQuestion={questions.filter(q => !q.isExample).length}
              answeredQuestions={gameResults.map(r => r.isCorrect)}
            />
            <Card className="main-card">
              <Card.Header className="text-center bg-success text-white">
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/')}
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

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!questions[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={questions.filter(q => !q.isExample).length}
              currentQuestion={currentQuestion - 1} // Subtract 1 for example
              answeredQuestions={gameResults.map(r => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className={`text-center ${questions[currentQuestion].isExample ? 'bg-warning' : 'bg-primary'} text-white`}>
              <h4 className="mb-0">
                {questions[currentQuestion].isExample && (
                  <span className="badge badge-light text-dark mr-2">Παράδειγμα</span>
                )}
                Διαλέξε τη σωστή κατάληξη
              </h4>
            </Card.Header>
            <Card.Body>

          <Card className="mb-4 border-primary">
            <Card.Body className="text-center">
              <h3 className="display-5 mb-4 text-primary">
                {question.sentence}
              </h3>
            </Card.Body>
          </Card>

          <Row className="justify-content-center mb-4">
            {question.options.map((option, index) => (
              <Col
                key={index}
                xs={4}
                className="mb-3 d-flex justify-content-center"
              >
                <Button
                  block
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  variant={
                    selectedAnswer === option
                      ? option === question.correct
                        ? "success"
                        : "danger"
                      : selectedAnswer && option === question.correct
                      ? "outline-success"
                      : "outline-primary"
                  }
                  size="lg"
                  className="py-3"
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

export default GreekAdjectiveEndingGame;
