import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import "../../styles/Game.css";
import "../../styles/Game10And11.css";
import { level10Words, 
  // level12Words 
} from "../Data/Game10And11";

const GreekCliticSuffixGame = ({ level }) => {
  // Select words based on level prop
  const words = React.useMemo(() => {
    return level10Words;
  }, []);

  const [wordPool, setWordPool] = useState([]);
  const [columns, setColumns] = useState({
    ων: [],
    ω: [],
    ουμε: [],
    ετε: [],
    ηκαμε: [],
    ηκατε: [],
  });
  const [score, setScore] = useState({ correct: 0, total: 0, message: "" });
  const [showFeedback, setShowFeedback] = useState(false);

  const initializeGame = React.useCallback(() => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWordPool(shuffledWords);
    setColumns({
      ων: [],
      ω: [],
      ουμε: [],
      ετε: [],
      ηκαμε: [],
      ηκατε: [],
    });
    setScore({ correct: 0, total: 0, message: "" });
    setShowFeedback(false);
  }, [words]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleDragStart = (e, wordData) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(wordData));
    e.target.style.opacity = "0.5";
    e.target.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    e.target.classList.remove("dragging");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, targetSuffix) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const wordData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (!wordData) return;

    // Check if word is already in a column
    const isWordInColumns = Object.values(columns).some((column) =>
      column.some((w) => w.id === wordData.id)
    );

    // If word is not in any column, remove it from pool
    if (!isWordInColumns) {
      setWordPool((prev) => prev.filter((w) => w.id !== wordData.id));
    }

    // Remove word from any existing column
    const newColumns = { ...columns };
    Object.keys(newColumns).forEach((suffix) => {
      newColumns[suffix] = newColumns[suffix].filter(
        (w) => w.id !== wordData.id
      );
    });

    // Add word to target column
    newColumns[targetSuffix] = [
      ...newColumns[targetSuffix],
      { ...wordData, placedSuffix: targetSuffix },
    ];

    setColumns(newColumns);
    setShowFeedback(false);
  };

  const returnToPool = (wordData, fromColumn) => {
    setColumns((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((w) => w.id !== wordData.id),
    }));

    setWordPool((prev) => [
      ...prev,
      {
        id: wordData.id,
        word: wordData.word,
        suffix: wordData.suffix,
      },
    ]);
    setShowFeedback(false);
  };

  const checkAnswers = () => {
    let correct = 0;
    let total = 0;

    Object.keys(columns).forEach((suffix) => {
      columns[suffix].forEach((wordData) => {
        total++;
        if (wordData.suffix === suffix) {
          correct++;
        }
      });
    });

    let message;
    if (correct === total && total > 0) {
      message = "🎉 Τέλεια! Όλα σωστά!";
    } else if (correct >= total * 0.8) {
      message = "👍 Πολύ καλά!";
    } else if (correct >= total * 0.6) {
      message = "😊 Καλά!";
    } else {
      message = "💪 Καλή προσπάθεια! Προσπάθησε ξανά.";
    }

    setScore({ correct, total, message });
    setShowFeedback(true);
  };

  const resetGame = () => {
    initializeGame();
  };

  const getSuffixTitle = (suffix) => {
    const titles = {
      ων: "-ων",
      ω: "-ω",
      ουμε: "-ουμε",
      ετε: "-ετε",
      ηκαμε: "-ηκαμε",
      ηκατε: "-ηκατε",
    };
    return titles[suffix] || `-${suffix}`;
  };

  const WordCard = ({ wordData, isDraggable = true }) => (
    <div
      className={`word-card ${isDraggable ? "draggable" : ""} ${
        showFeedback
          ? wordData.suffix === wordData.placedSuffix
            ? "correct"
            : "incorrect"
          : ""
      }`}
      draggable={isDraggable}
      onDragStart={
        isDraggable ? (e) => handleDragStart(e, wordData) : undefined
      }
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onClick={
        !isDraggable
          ? () => returnToPool(wordData, wordData.placedSuffix)
          : undefined
      }
    >
      {wordData.word}
    </div>
  );

  const SuffixColumn = ({ suffix, words }) => (
    <Card
      className={`suffix-column`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, suffix)}
    >
      <Card.Header className={`text-center`}>
        {getSuffixTitle(suffix)}
      </Card.Header>
      <Card.Body
        className="column-body column-body-1012"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {words.map((wordData) => (
          <WordCard
            key={`${wordData.id}-${suffix}`}
            wordData={wordData}
            isDraggable={false}
          />
        ))}
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={12}>
          <Card className="main-card">
            <Card.Header className="text-center">
              <h2>Ταξινόμηση κατά Παραλήγοντα</h2>
              <p className="mb-0">
                Σύρε τις λέξεις στη σωστή στήλη ανάλογα με την κατάληξή τους
              </p>
            </Card.Header>

            <Card.Body>
              <Row>
                {/* Word Pool */}
                <Col md={2} lg={2} className="mb-4">
                  <Card className="word-pool-card">
                    <Card.Header className="text-center">
                      Λέξεις προς ταξινόμηση
                    </Card.Header>
                    <Card.Body className="word-pool-body">
                      <div className="word-pool-grid">
                        {wordPool.map((wordData) => (
                          <WordCard
                            key={`pool-${wordData.id}`}
                            wordData={wordData}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Sorting Area */}
                <Col md={10} lg={10} style={{ padding: 0 }}>
                  {/* Columns container with responsive layout */}
                  <div className="columns-container">
                    <Row className="d-flex flex-wrap m-0">
                      {Object.entries(columns).map(([suffix, words]) => (
                        <Col
                          key={suffix}
                          xs={6}
                          sm={4}
                          md={2}
                          lg={2}
                          className="mb-3"
                        >
                          <SuffixColumn suffix={suffix} words={words} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Col>
              </Row>

              {/* Controls */}
              <Row className="mt-4">
                <Col className="text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={checkAnswers}
                    className="me-3"
                  >
                    Έλεγχος Απαντήσεων
                  </Button>
                  <Button variant="secondary" size="lg" onClick={resetGame}>
                    Επανεκκίνηση
                  </Button>
                </Col>
              </Row>

              {/* Score Display */}
              {showFeedback && (
                <Row className="mt-4">
                  <Col>
                    <Alert
                      variant={
                        score.correct === score.total ? "success" : "info"
                      }
                      className="text-center"
                    >
                      <h4>
                        Σκορ: {score.correct}/{score.total}
                      </h4>
                      <p className="mb-0">{score.message}</p>
                    </Alert>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GreekCliticSuffixGame;
