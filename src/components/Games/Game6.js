import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import "../../styles/Game.css";
import "../../styles/Game6.css";

const GreekWordSortingGame = () => {
  const words = React.useMemo(
    () => [
      { id: "1", word: "καταδικάζω", prefix: "κατα" },
      { id: "2", word: "παρατείνω", prefix: "παρα" },
      { id: "3", word: "διαφέρω", prefix: "δια" },
      { id: "4", word: "αναγέννηση", prefix: "ανα" },
      { id: "5", word: "παράνοια", prefix: "παρα" },
      { id: "6", word: "καταβυθίζω", prefix: "κατα" },
      { id: "7", word: "διαφωνώ", prefix: "δια" },
      { id: "8", word: "παραμένω", prefix: "παρα" },
      { id: "9", word: "καταδίωξη", prefix: "κατα" },
      { id: "10", word: "διαγωνίζομαι", prefix: "δια" },
      { id: "11", word: "αναθεώρηση", prefix: "ανα" },
      { id: "12", word: "καταγγέλλω", prefix: "κατα" },
      { id: "13", word: "διαπληκτίζομαι", prefix: "δια" },
      { id: "14", word: "διανυκτερεύω", prefix: "δια" },
      { id: "15", word: "κατασπαταλώ", prefix: "κατα" },
      { id: "16", word: "αναρωτιέμαι", prefix: "ανα" },
      { id: "17", word: "αναστροφή", prefix: "ανα" },
      { id: "18", word: "παραφροσύνη", prefix: "παρα" },
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
    e.dataTransfer.setData("text/plain", JSON.stringify(wordData));
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPrefix) => {
    e.preventDefault();
    
    const wordData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (!wordData) return;

    // Check if word is already in a column
    const isWordInColumns = Object.values(columns).some(column => 
      column.some(w => w.id === wordData.id)
    );
    
    // If word is not in any column, remove it from pool
    if (!isWordInColumns) {
      setWordPool(prev => prev.filter(w => w.id !== wordData.id));
    }
    
    // Remove word from any existing column
    const newColumns = { ...columns };
    Object.keys(newColumns).forEach(prefix => {
      newColumns[prefix] = newColumns[prefix].filter(w => w.id !== wordData.id);
    });
    
    // Add word to target column
    newColumns[targetPrefix] = [
      ...newColumns[targetPrefix],
      { ...wordData, placedPrefix: targetPrefix }
    ];
    
    setColumns(newColumns);
    setShowFeedback(false);
  };

  const returnToPool = (wordData, fromColumn) => {
    setColumns(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(w => w.id !== wordData.id),
    }));

    setWordPool(prev => [
      ...prev,
      { 
        id: wordData.id, 
        word: wordData.word, 
        prefix: wordData.prefix
      }
    ]);
    setShowFeedback(false);
  };

  const checkAnswers = () => {
    let correct = 0;
    let total = 0;

    Object.keys(columns).forEach(prefix => {
      columns[prefix].forEach(wordData => {
        total++;
        if (wordData.prefix === prefix) {
          correct++;
        }
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

    setScore({ correct, total, message });
    setShowFeedback(true);
  };

  const resetGame = () => {
    initializeGame();
  };

  const WordCard = ({ wordData, isDraggable = true }) => (
    <div
      className={`word-card ${isDraggable ? "draggable" : ""} ${
        showFeedback ? 
          (wordData.prefix === wordData.placedPrefix ? "correct" : "incorrect") 
          : ""
      }`}
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => handleDragStart(e, wordData) : undefined}
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
      <Card.Body 
        className="column-body"
        onDragOver={handleDragOver}
      >
        {words.map((wordData) => (
          <WordCard
            key={`${wordData.id}-${prefix}`}
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
              <h2>Παιχνίδι Ταξινόμησης λέξεων</h2>
              <p className="mb-0">
                Σύρε τις λέξεις στη σωστή στήλη ανάλογα με το πρόθημά τους
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

                {/* Sorting Area - UPDATED LAYOUT */}
                <Col md={10} lg={10}>
                  <Row className="flex-nowrap overflow-auto  mb-4">
                    {Object.entries(columns).map(([prefix, words]) => (
                      <Col key={prefix} xs={6} sm={3} md={3}  style={{ minWidth: '250px' }}>
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