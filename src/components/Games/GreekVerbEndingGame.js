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

const GreekVerbEndingGame = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const questions = [
    {
      sentence: "Εγώ κάθε μέρα γράφ______",
      options: ["-ω", "-εις", "-ει"],
      correct: "-ω",
      explanation:
        'Το 1ο ενικό πρόσωπο στον ενεστώτα παίρνει την κατάληξη -ω',
      isExample: true,
    },
    {
      sentence: "Εμείς τώρα γράφ______",
      options: ["-ετε", "-ηκαμε", "-ουμε"],
      correct: "-ουμε",
      explanation:
        'Το "εμείς" (1ο πληθυντικό πρόσωπο) στον ενεστώτα παίρνει την κατάληξη -ουμε',
    },
    {
      sentence: "Εσείς χθες χαθ_____",
      options: ["-ήκαμε", "-ήκατε", "-ω"],
      correct: "-ήκατε",
      explanation:
        'Το "εσείς" (2ο πληθυντικό πρόσωπο) στον παρελθόντα παίρνει την κατάληξη -ήκατε',
    },
    {
      sentence: "Αυτός χθες έτρεξ______",
      options: ["-ε", "-αμε", "-ατε"],
      correct: "-ε",
      explanation:
        "Το 3ο ενικό πρόσωπο στον παρελθόντα παίρνει την κατάληξη -ε",
    },
    {
      sentence: "Εμείς χθες φάγ______",
      options: ["-αμε", "-ατε", "-αν"],
      correct: "-αμε",
      explanation:
        'Το "εμείς" (1ο πληθυντικό πρόσωπο) στον παρελθόντα παίρνει την κατάληξη -αμε',
    },
    {
      sentence: "Αυτά τα βιβλί______",
      options: ["-α", "-ων", "-ους"],
      correct: "-ων",
      explanation:
        "Τα ουδέτερα ουσιαστικά στη γενική πληθυντικού παίρνουν την κατάληξη -ων",
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
      logGameResults();
    }
  };

  // Log game results function
  const logGameResults = () => {
    const now = new Date();
    const datetime = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' + 
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0');
    
    const results = {
      studentId: "student123",
      datetime: datetime,
      gameName: "GreekVerbEndingGame",
      questions: gameResults
    };
    
    console.log(results);
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
                Διάλεξε τη σωστή κατάληξη
              </h4>
            </Card.Header>
            <Card.Body>

          <Card className="mb-4 border-primary">
            <Card.Body className="text-center">
              <h3 className="display-5 mb-4 text-primary">
                {selectedAnswer 
                  ? question.sentence.replace(/_{2,}/, selectedAnswer.slice(1))
                  : question.sentence
                }
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
                      ? "success"
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

export default GreekVerbEndingGame;
