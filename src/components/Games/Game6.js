import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import "../../styles/Game.css";

const GreekWordSortingGame = () => {
  const words = React.useMemo(
    () => [
      { word: "καταδικάζω", prefix: "κατα" },
      { word: "παρατείνω", prefix: "παρα" },
      { word: "διαφέρω", prefix: "δια" },
      { word: "αναγέννηση", prefix: "ανα" },
      { word: "παράνοια", prefix: "παρα" },
      { word: "καταβυθίζω", prefix: "κατα" },
      { word: "διαφωνώ", prefix: "δια" },
      { word: "παραμένω", prefix: "παρα" },
      { word: "καταδίωξη", prefix: "κατα" },
      { word: "διαγωνίζομαι", prefix: "δια" },
      { word: "αναθεώρηση", prefix: "ανα" },
      { word: "καταγγέλλω", prefix: "κατα" },
      { word: "διαπληκτίζομαι", prefix: "δια" },
      { word: "διανυκτερεύω", prefix: "δια" },
      { word: "κατασπαταλώ", prefix: "κατα" },
      { word: "αναρωτιέμαι", prefix: "ανα" },
      { word: "αναστροφή", prefix: "ανα" },
      { word: "παραφροσύνη", prefix: "παρα" },
    ],
    []
  );

  const [wordPool, setWordPool] = useState([]);
  const [columns, setColumns] = useState({
    κατα: [],
    ανα: [],
    παρα: [],
    δια: [],
  });
  const [draggedWord, setDraggedWord] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0, message: "" });
  const [showFeedback, setShowFeedback] = useState(false);

  const initializeGame = React.useCallback(() => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWordPool(shuffledWords);
    setColumns({ κατα: [], ανα: [], παρα: [], δια: [] });
    setScore({ correct: 0, total: 0, message: "" });
    setShowFeedback(false);
  }, [words]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleDragStart = (e, wordData) => {
    setDraggedWord(wordData);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedWord(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPrefix) => {
    e.preventDefault();
    if (!draggedWord) return;

    // Remove from word pool
    setWordPool((prev) => prev.filter((w) => w.word !== draggedWord.word));

    // Add to target column
    setColumns((prev) => ({
      ...prev,
      [targetPrefix]: [
        ...prev[targetPrefix],
        { ...draggedWord, placedPrefix: targetPrefix },
      ],
    }));

    setDraggedWord(null);
    setShowFeedback(false);
  };

  const returnToPool = (wordData, fromColumn) => {
    // Remove from column
    setColumns((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((w) => w.word !== wordData.word),
    }));

    // Add back to pool
    setWordPool((prev) => [
      ...prev,
      { word: wordData.word, prefix: wordData.prefix },
    ]);
    setShowFeedback(false);
  };

  const checkAnswers = () => {
    let correct = 0;
    let total = 0;

    const updatedColumns = { ...columns };

    Object.keys(columns).forEach((prefix) => {
      columns[prefix].forEach((wordData) => {
        total++;
        const isCorrect = wordData.prefix === wordData.placedPrefix;
        if (isCorrect) correct++;

        // Update the word with feedback class
        updatedColumns[prefix] = updatedColumns[prefix].map((w) =>
          w.word === wordData.word
            ? { ...w, feedback: isCorrect ? "correct" : "incorrect" }
            : w
        );
      });
    });

    let message;
    if (correct === total && total > 0) {
      message = "🎉 Τέλεια!";
    } else if (correct >= 15) {
      message = "👍 Πολύ καλά!";
    } else if (correct >= 11) {
      message = "😊 Καλά!";
    } else {
      message = "💪 Καλή προσπάθεια! Προσπάθησε ξανά.";
    }

    setColumns(updatedColumns);
    setScore({ correct, total, message });
    setShowFeedback(true);
  };

  const resetGame = () => {
    initializeGame();
  };

  const WordCard = ({ wordData, isDraggable = true }) => (
    <div
      className={`word-card ${isDraggable ? "draggable" : ""} ${
        wordData.feedback === "correct"
          ? "correct"
          : wordData.feedback === "incorrect"
          ? "incorrect"
          : ""
      }`}
      draggable={isDraggable}
      onDragStart={
        isDraggable ? (e) => handleDragStart(e, wordData) : undefined
      }
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onClick={
        !isDraggable
          ? () => returnToPool(wordData, wordData.placedPrefix)
          : undefined
      }
    >
      {wordData.word}
    </div>
  );

  const PrefixColumn = ({ prefix, words }) => (
    <Card
      className={`prefix-column ${
        prefix === "κατα"
          ? "kataborder"
          : prefix === "ανα"
          ? "anaborder"
          : prefix === "παρα"
          ? "paraborder"
          : "diaborder"
      }`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, prefix)}
    >
      <Card.Header
        className={`text-center ${
          prefix === "κατα"
            ? "kataheader"
            : prefix === "ανα"
            ? "anaheader"
            : prefix === "παρα"
            ? "paraheader"
            : "diaheader"
        }`}
      >
        {prefix}-
      </Card.Header>
      <Card.Body className="column-body">
        {words.map((wordData, index) => (
          <WordCard
            key={`${wordData.word}-${index}`}
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
        <Col md={10} lg={8}>
          <Card className="main-card">
            <Card.Header className="text-center">
              <h2>Παιχνίδι Ταξινόμησης λέξεων</h2>
              <p className="mb-0">
                Σύρε τις λέξεις στη σωστή στήλη ανάλογα με το πρόθημά τους
              </p>
            </Card.Header>

            <Card.Body>
              <Row>
                {/* Word Pool */}
                <Col md={12} lg={4} className="mb-4">
                  <Card className="word-pool-card">
                    <Card.Header className="text-center">
                      Λέξεις προς ταξινόμηση
                    </Card.Header>
                    <Card.Body className="word-pool-body">
                      <div className="word-pool-grid">
                        {wordPool.map((wordData, index) => (
                          <WordCard
                            key={`pool-${wordData.word}-${index}`}
                            wordData={wordData}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Sorting Area */}
                <Col md={12} lg={8}>
                  <Row>
                    {Object.entries(columns).map(([prefix, words]) => (
                      <Col key={prefix} sm={6} className="mb-4">
                        <PrefixColumn prefix={prefix} words={words} />
                      </Col>
                    ))}
                  </Row>
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
                    >
                      <div className="text-center">
                        <h4>
                          Σκορ: {score.correct}/{score.total}
                        </h4>
                        <p className="mb-0">{score.message}</p>
                      </div>
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

export default GreekWordSortingGame;
