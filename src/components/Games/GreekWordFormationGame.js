import React, { useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import "../../styles/Game.css";

const GreekWordFormationGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing"); // 'playing' or 'results'
  const [gameData, setGameData] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = [
    {
      question: "Με ποιο επίθημα παράγεται ουσιαστικό από το ρήμα αναλύω;",
      baseWord: "αναλύω",
      wordType: "ρήμα",
      targetType: "ουσιαστικό",
      options: ["-της", "-ση", "-μα", "-ιμος"],
      correct: "-ση",
      result: "ανάλυση",
      explanation:
        "Από ρήματα σε -ύω συχνά παράγονται ουσιαστικά με το επίθημα -ση (αναλύω → ανάλυση)",
    },
    {
      question: "Με ποιο επίθημα παράγεται επίθετο από το ουσιαστικό μέταλλο;",
      baseWord: "μέταλλο",
      wordType: "ουσιαστικό",
      targetType: "επίθετο",
      options: ["-ικός", "-μα", "-της", "-μένος"],
      correct: "-ικός",
      result: "μεταλλικός",
      explanation:
        "Από ουσιαστικά συχνά παράγονται επίθετα με το επίθημα -ικός (μέταλλο → μεταλλικός)",
    },
    {
      question: "Με ποιο επίθημα παράγεται ουσιαστικό από το επίθετο γλυκός;",
      baseWord: "γλυκός",
      wordType: "επίθετο",
      targetType: "ουσιαστικό",
      options: ["-ύτητα", "-ικός", "-ώνω", "-ιμος"],
      correct: "-ύτητα",
      result: "γλυκύτητα",
      explanation:
        "Από επίθετα παράγονται αφηρημένα ουσιαστικά με το επίθημα -ύτητα (γλυκός → γλυκύτητα)",
    },
    {
      question: "Με ποιο επίθημα παράγεται ρήμα από το ουσιαστικό τέλος;",
      baseWord: "τέλος",
      wordType: "ουσιαστικό",
      targetType: "ρήμα",
      options: ["-ώνω", "-ικός", "-ια", "-μα"],
      correct: "-ώνω",
      result: "τελειώνω",
      explanation:
        "Από ουσιαστικά παράγονται ρήματα με το επίθημα -ώνω (τέλος → τελειώνω)",
    },
    {
      question: "Με ποιο επίθημα παράγεται ουσιαστικό από το ρήμα διδάσκω;",
      baseWord: "διδάσκω",
      wordType: "ρήμα",
      targetType: "ουσιαστικό (πρόσωπο)",
      options: ["-αλος", "-ας", "-της", "-μα"],
      correct: "-αλος",
      result: "διδάσκαλος",
      explanation:
        "Από ρήματα παράγονται ουσιαστικά που δηλώνουν πρόσωπα με το επίθημα -αλος (διδάσκω → διδάσκαλος)",
    },
  ];

  const handleAnswerSelect = (answer) => {
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;

    setSelectedAnswer(answer);
    setShowExplanation(true);

    // Record the attempt
    const attempt = {
      question: question.question,
      baseWord: question.baseWord,
      wordType: question.wordType,
      targetType: question.targetType,
      selected: answer,
      correct: question.correct,
      result: question.result,
      isCorrect,
      explanation: question.explanation,
    };

    setGameData((prev) => [...prev, attempt]);

    if (isCorrect) {
      setFeedback(`Σωστό! 🎉`);
      setScore((prev) => prev + 1);
    } else {
      setFeedback(`Λάθος. Η σωστή απάντηση είναι: ${question.correct}`);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback("");
      setShowExplanation(false);
    } else {
      setGameState("results");
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFeedback("");
    setScore(0);
    setGameData([]);
    setGameState("playing");
    setShowExplanation(false);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameState === "results") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height" style={{ overflowY: "auto" }}>
        <Card className="w-100" style={{ maxWidth: "800px" }}>
          <Card.Header className="text-center bg-primary text-white">
            <h2 className="mb-0">Αποτελέσματα</h2>
          </Card.Header>

          <Card.Body>
            <div className="text-center mb-4">
              <h3 className="text-primary">
                Τελικό Σκορ: {score}/{questions.length}
              </h3>
              <p className="h4 mt-3">
                {score === questions.length
                  ? "🎉 Τέλεια! Όλα σωστά!"
                  : score >= questions.length * 0.8
                  ? "👍 Πολύ καλά!"
                  : score >= questions.length * 0.6
                  ? "😊 Καλά!"
                  : "💪 Συνέχισε την προσπάθεια!"}
              </p>
            </div>

            <ListGroup className="mb-4">
              {gameData.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  variant={item.isCorrect ? "success" : "danger"}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{item.question}</strong>
                    <span>{item.isCorrect ? "✓" : "✗"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-primary">{item.baseWord}</span> ({item.wordType}) →{" "}
                    <span className="text-success">{item.result}</span> ({item.targetType})
                  </div>
                  <div className="mb-2">
                    <strong>Επιλογή σας:</strong> {item.selected}
                    {!item.isCorrect && (
                      <span className="text-danger"> (Λάθος)</span>
                    )}
                  </div>
                  {!item.isCorrect && (
                    <div className="mb-2">
                      <strong>Σωστή απάντηση:</strong> {item.correct}
                    </div>
                  )}
                  <div className="mt-2 p-2 bg-light rounded">
                    <em>{item.explanation}</em>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={resetGame}>
                Παίξτε Ξανά
              </Button>
              <Button variant="secondary" href="/">
                Αρχική Σελίδα
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center">
      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Header className="text-center bg-primary text-white">
          <h2 className="mb-0">13η Δραστηριότητα: Κανόνες Παραγωγής Λέξεων</h2>
        </Card.Header>

        <Card.Body>
          <ProgressBar
            now={progress}
            label={`${currentQuestion + 1}/${questions.length}`}
            className="w-100 mb-4"
          />

          <Card className="mb-4 border-primary">
            <Card.Body>
              <div className="text-center mb-3">
                <h4 className="text-primary">{question.question}</h4>
              </div>
              
              <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <div className="text-center p-2 bg-light rounded">
                  <div className="font-weight-bold text-primary">{question.baseWord}</div>
                  <small className="text-muted">({question.wordType})</small>
                </div>
                <div className="text-muted">→</div>
                <div className="text-center p-2 bg-light rounded">
                  <div className="font-weight-bold text-success">
                    {selectedAnswer === question.correct ? question.result : "?"}
                  </div>
                  <small className="text-muted">({question.targetType})</small>
                </div>
              </div>

              <Row className="justify-content-center">
                {question.options.map((option, index) => (
                  <Col key={index} md={3} className="mb-3 d-flex justify-content-center">
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

          {feedback && (
            <Alert
              variant={feedback.includes("Σωστό") ? "success" : "danger"}
              className="text-center"
            >
              {feedback}
            </Alert>
          )}

          {showExplanation && (
            <Alert variant="info" className="mb-4">
              <div className="d-flex">
                <div className="mr-2">📚</div>
                <div>
                  <strong>Εξήγηση:</strong> {question.explanation}
                </div>
              </div>
            </Alert>
          )}

          <div className="d-flex justify-content-center gap-3">
            {selectedAnswer && (
              <Button variant="primary" onClick={nextQuestion}>
                {currentQuestion < questions.length - 1
                  ? "Επόμενη Ερώτηση"
                  : "Τέλος"}
              </Button>
            )}
            {/* <Button variant="secondary" onClick={resetGame}>
              Επανάληψη
            </Button> */}
          </div>
        </Card.Body>
      </Card>

      {/* Word Formation Rules Reference */}
      <Card className="w-100 mt-4" style={{ maxWidth: "800px" }}>
        <Card.Header className="bg-light">
          <h5 className="mb-0">Κανόνες Παραγωγής Λέξεων</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-primary">Επιθήματα για ουσιαστικά:</h6>
              <ul className="pl-3">
                <li>• -ση: ανάλυση, σύνθεση</li>
                <li>• -μα: γράψιμο, διάβασμα</li>
                <li>• -της: γραφέας, διδάσκαλος</li>
                <li>• -ύτητα: γλυκύτητα, ομορφιά</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-success">Επιθήματα για επίθετα:</h6>
              <ul className="pl-3">
                <li>• -ικός: μεταλλικός, τοπικός</li>
                <li>• -ινος: γυάλινος, ξύλινος</li>
                <li>• -ιμος: σπουδαίος, αξιόλογος</li>
                <li>• -ώδης: ελαιώδης, υγρώδης</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GreekWordFormationGame;