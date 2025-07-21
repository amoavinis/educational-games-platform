import React, { useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import "../../styles/Game.css";

const GreekMorphologyGame = () => {
  const questions = [
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

  const scoreThresholds = [
    {
      min: 90,
      message: "🎉 Τέλεια! Είσαι εξπέρ στη μορφολογία!",
      color: "#4ecdc4",
    },
    {
      min: 70,
      message: "👍 Πολύ καλά! Καταλαβαίνεις τη μορφημική ανάλυση!",
      color: "#4ecdc4",
    },
    { min: 50, message: "😊 Καλά! Συνέχισε να εξασκείσαι!", color: "#f39c12" },
    {
      min: 0,
      message: "💪 Μη το βάζεις κάτω! Δοκίμασε ξανά!",
      color: "#ff6b6b",
    },
  ];

  const [gameState, setGameState] = useState("playing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [gameData, setGameData] = useState({
    rounds: [],
    totalCorrect: 0,
    totalRounds: questions.length,
  });

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
    if (answered) return;

    setSelectedChoice(choiceIndex);
    setAnswered(true);

    const isCorrect = choiceIndex === questions[currentQuestion].correct;

    setGameData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          word: questions[currentQuestion].word,
          choices: questions[currentQuestion].choices,
          selectedChoice: choiceIndex,
          correctChoice: questions[currentQuestion].correct,
          correct: isCorrect,
        },
      ],
      totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
    }));

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
      setAnswered(false);
    } else {
      setGameState("completed");
      /* reportFn(gameData); */
    }
  };

  const resetGame = () => {
    setGameState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedChoice(null);
    setAnswered(false);
    setGameData({
      rounds: [],
      totalCorrect: 0,
      totalRounds: questions.length,
    });
  };

  const getScoreInfo = () => {
    const percentage = Math.round(
      (gameData.totalCorrect / questions.length) * 100
    );
    return scoreThresholds.find((threshold) => percentage >= threshold.min);
  };

  if (gameState !== "completed") {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Μορφολογική Ανάλυση</h2>

        <ProgressBar
          now={progress}
          label={`${currentQuestion + 1}/${questions.length}`}
          className="w-100 mb-4"
        />

        <div className="mb-4 text-center">
          <div className="display-4 font-weight-bold mb-3">{currentQ.word}</div>
          <p className="text-muted">Επίλεξε τη σωστή μορφολογική ανάλυση</p>
        </div>

        <Row className="mb-4 w-100">
          {currentQ.choices.map((choice, index) => {
            let variant = "outline-secondary";
            if (answered) {
              if (index === currentQ.correct) {
                variant = "success";
              } else if (index === selectedChoice) {
                variant = "danger";
              }
            } else if (index === selectedChoice) {
              variant = "primary";
            }

            return (
              <Col key={index} md={6} className="mb-3">
                <Button
                  className="w-100 py-3"
                  variant={variant}
                  onClick={() => handleChoiceSelect(index)}
                  disabled={answered}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="mr-2 badge bg-dark">{index + 1}</span>
                    {formatMorphemes(choice)}
                  </div>
                </Button>
              </Col>
            );
          })}
        </Row>

        {answered && (
          <Button
            variant={
              selectedChoice === currentQ.correct ? "success" : "primary"
            }
            onClick={handleNext}
            className="mt-3"
          >
            {currentQuestion < questions.length - 1 ? "Επόμενη" : "Τέλος"}
          </Button>
        )}
      </Container>
    );
  } else {
    const scoreInfo = getScoreInfo();

    return (
      <Container className="d-flex flex-column align-items-center justify-content-center">
        <Card className="w-100">
          <Card.Header as="h3">Αποτελέσματα</Card.Header>
          <Card.Body>
            <p
              className="h4 text-center mb-4"
              style={{ color: scoreInfo.color }}
            >
              {scoreInfo.message}
            </p>

            <p className="text-center h2 mb-4">
              {gameData.totalCorrect} / {gameData.totalRounds}
            </p>

            <div className="mb-4">
              <h5>Αναλυτικά Αποτελέσματα:</h5>
              <ul className="list-group">
                {gameData.rounds.map((round, index) => (
                  <li
                    key={index}
                    className={`list-group-item ${
                      round.correct
                        ? "list-group-item-success"
                        : "list-group-item-danger"
                    }`}
                  >
                    <div>
                      <strong>Λέξη:</strong> {round.word}
                    </div>
                    <div>
                      <strong>Επιλογή σου:</strong>{" "}
                      {formatMorphemes(round.choices[round.selectedChoice])}
                    </div>
                    {!round.correct && (
                      <div>
                        <strong>Σωστή απάντηση:</strong>{" "}
                        {formatMorphemes(round.choices[round.correctChoice])}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" href="/">
                Αρχική Σελίδα
              </Button>
              <Button variant="primary" onClick={resetGame}>
                Παίξτε Ξανά
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
};

export default GreekMorphologyGame;
