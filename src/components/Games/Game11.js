// Game 11
import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import "../../styles/Game11.css";
import { level11Words } from "../Data/Game11Data";
import { addReport } from "../../services/reports";

const Game11 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => level11Words, []);

  const [wordPool, setWordPool] = useState([]);
  const [columns, setColumns] = useState({
    ων: [],
    ω: [],
    ουμε: [],
    ετε: [],
    ηκαμε: [],
    ηκατε: [],
  });
  const [wordAttempts, setWordAttempts] = useState({}); // Track attempts per word
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const shuffle = (arr) =>
    arr
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

  const initializeGame = React.useCallback(() => {
    const exampleWords = words.filter((w) => w.isExample);
    // Show all example words initially
    setWordPool(exampleWords);
    setColumns({
      ων: [],
      ω: [],
      ουμε: [],
      ετε: [],
      ηκαμε: [],
      ηκατε: [],
    });
    setWordAttempts({});
    setGameStartTime(Date.now());
    setGameResults([]);
    setGameCompleted(false);
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

    const isCorrect = wordData.suffix === targetSuffix;
    const currentAttempts = wordAttempts[wordData.id] || 0;
    const newAttempts = currentAttempts + 1;

    // Update attempts count
    setWordAttempts((prev) => ({
      ...prev,
      [wordData.id]: newAttempts,
    }));

    if (isCorrect) {
      // Correct placement - move to column and add to results
      const score = newAttempts; // 1 for first try, 2 for second, 3 for third+

      if (!wordData.isExample) {
        setGameResults((prev) => [...prev, { word: wordData.word, score }]);
      }

      // Remove from pool
      setWordPool((prev) => prev.filter((w) => w.id !== wordData.id));

      // Remove from any existing column
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach((suffix) => {
        newColumns[suffix] = newColumns[suffix].filter((w) => w.id !== wordData.id);
      });

      // Add to correct column
      newColumns[targetSuffix] = [...newColumns[targetSuffix], { ...wordData, placedSuffix: targetSuffix }];

      setColumns(newColumns);

      // If this was an example word, check if all examples are placed
      if (wordData.isExample) {
        const exampleWords = words.filter((w) => w.isExample);
        const placedExamples = Object.values(newColumns)
          .flat()
          .filter((w) => w.isExample);

        // If all examples are placed, add all regular words to the pool
        if (placedExamples.length === exampleWords.length) {
          const regularWords = shuffle(words.filter((w) => !w.isExample));
          setWordPool((prev) => [...prev, ...regularWords]);
        }
      } else {
        // Check if all regular words are placed
        const regularWords = words.filter((w) => !w.isExample);
        const placedRegularWords = Object.values(newColumns)
          .flat()
          .filter((w) => !w.isExample);

        if (placedRegularWords.length === regularWords.length) {
          // All regular words placed - game completed
          setTimeout(() => {
            setGameCompleted(true);
            submitGameResults();
          }, 500);
        }
      }
    } else {
      // Wrong placement
      if (newAttempts >= 2) {
        // After 2 wrong attempts, place automatically in correct column
        const score = 3;

        if (!wordData.isExample) {
          setGameResults((prev) => [...prev, { word: wordData.word, score }]);
        }

        // Remove from pool
        setWordPool((prev) => prev.filter((w) => w.id !== wordData.id));

        // Remove from any existing column
        const newColumns = { ...columns };
        Object.keys(newColumns).forEach((suffix) => {
          newColumns[suffix] = newColumns[suffix].filter((w) => w.id !== wordData.id);
        });

        // Add to correct column
        newColumns[wordData.suffix] = [...newColumns[wordData.suffix], { ...wordData, placedSuffix: wordData.suffix }];

        setColumns(newColumns);

        // If this was an example word, check if all examples are placed
        if (wordData.isExample) {
          const exampleWords = words.filter((w) => w.isExample);
          const placedExamples = Object.values(newColumns)
            .flat()
            .filter((w) => w.isExample);

          // If all examples are placed, add all regular words to the pool
          if (placedExamples.length === exampleWords.length) {
            const regularWords = shuffle(words.filter((w) => !w.isExample));
            setWordPool((prev) => [...prev, ...regularWords]);
          }
        } else {
          // Check if all regular words are placed
          const regularWords = words.filter((w) => !w.isExample);
          const placedRegularWords = Object.values(newColumns)
            .flat()
            .filter((w) => !w.isExample);

          if (placedRegularWords.length === regularWords.length) {
            // All regular words placed - game completed
            setTimeout(() => {
              setGameCompleted(true);
              submitGameResults();
            }, 500);
          }
        }
      } else {
        // Put word back in pool for another attempt
        // Word is already in pool, just need to remove from any column
        const newColumns = { ...columns };
        Object.keys(newColumns).forEach((suffix) => {
          newColumns[suffix] = newColumns[suffix].filter((w) => w.id !== wordData.id);
        });
        setColumns(newColumns);
      }
    }
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

    const totalTime = gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0;

    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "GreekCliticSuffixGame",
      questions: gameResults,
      totalTime: totalTime,
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
      className={`word-card ${isDraggable ? "draggable" : ""} ${wordData.isExample ? "example-word" : ""}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => handleDragStart(e, wordData) : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onClick={!isDraggable ? () => returnToPool(wordData, wordData.placedSuffix) : undefined}
    >
      {wordData.isExample && <span className="badge bg-warning text-dark me-1">Παράδειγμα</span>}
      {wordData.word}
    </div>
  );

  const SuffixColumn = ({ suffix, words }) => (
    <Card className={`suffix-column`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, suffix)}>
      <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
        {getSuffixTitle(suffix)}
      </Card.Header>
      <Card.Body className="column-body column-body-1012" onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        {words.map((wordData) => (
          <WordCard key={`${wordData.id}-${suffix}`} wordData={wordData} isDraggable={false} />
        ))}
      </Card.Body>
    </Card>
  );

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <Card className="main-card">
              <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
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
        <Col md={12} lg={12}>
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">Τοποθετώ την κάθε λέξη στη σωστή στήλη</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Word Pool */}
                <Col md={2} lg={2} className="mb-4">
                  <Card className="word-pool-card">
                    <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
                      Λέξεις προς ταξινόμηση
                    </Card.Header>
                    <Card.Body className="word-pool-body">
                      <div className="word-pool-grid">
                        {wordPool.map((wordData) => (
                          <WordCard key={`pool-${wordData.id}`} wordData={wordData} />
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
                        <Col key={suffix} xs={6} sm={4} md={2} lg={2} className="mb-3">
                          <SuffixColumn suffix={suffix} words={words} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Game11;
