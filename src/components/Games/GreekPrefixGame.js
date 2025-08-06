import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import "../../styles/Game.css";
import "../../styles/Game6.css";
import { addReport } from "../../services/reports";

const GreekWordSortingGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = React.useMemo(
    () => [
      { id: "0", word: "αναδιπλώνω", prefix: "ανα", isExample: true },
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
  const [wordAttempts, setWordAttempts] = useState({}); // Track attempts per word
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const initializeGame = React.useCallback(() => {
    const exampleWord = words.find(w => w.isExample);
    // Show only the example word initially
    setWordPool([exampleWord]);
    setColumns({ κατα: [], ανα: [], παρα: [], δια: [] });
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

    const isCorrect = wordData.prefix === targetPrefix;
    const currentAttempts = wordAttempts[wordData.id] || 0;
    const newAttempts = currentAttempts + 1;

    // Update attempts count
    setWordAttempts(prev => ({
      ...prev,
      [wordData.id]: newAttempts
    }));

    if (isCorrect) {
      // Correct placement - move to column and add to results
      const score = newAttempts; // 1 for first try, 2 for second, 3 for third+
      
      if (!wordData.isExample) {
        setGameResults(prev => [
          ...prev,
          { word: wordData.word, score }
        ]);
      }

      // Remove from pool
      setWordPool(prev => prev.filter(w => w.id !== wordData.id));
      
      // Remove from any existing column
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach((prefix) => {
        newColumns[prefix] = newColumns[prefix].filter(
          (w) => w.id !== wordData.id
        );
      });

      // Add to correct column
      newColumns[targetPrefix] = [
        ...newColumns[targetPrefix],
        { ...wordData, placedPrefix: targetPrefix },
      ];
      
      setColumns(newColumns);
      
      // If this was the example word, add all remaining words to the pool
      if (wordData.isExample) {
        const regularWords = words.filter(w => !w.isExample);
        setWordPool(prev => [...prev, ...regularWords]);
      } else {
        // Check if all regular words are placed
        const regularWords = words.filter(w => !w.isExample);
        const placedRegularWords = Object.values(newColumns).flat().filter(w => !w.isExample);
        
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
          setGameResults(prev => [
            ...prev,
            { word: wordData.word, score }
          ]);
        }

        // Remove from pool
        setWordPool(prev => prev.filter(w => w.id !== wordData.id));
        
        // Remove from any existing column
        const newColumns = { ...columns };
        Object.keys(newColumns).forEach((prefix) => {
          newColumns[prefix] = newColumns[prefix].filter(
            (w) => w.id !== wordData.id
          );
        });

        // Add to correct column
        newColumns[wordData.prefix] = [
          ...newColumns[wordData.prefix],
          { ...wordData, placedPrefix: wordData.prefix },
        ];
        
        setColumns(newColumns);
        
        // If this was the example word, add all remaining words to the pool
        if (wordData.isExample) {
          const regularWords = words.filter(w => !w.isExample);
          setWordPool(prev => [...prev, ...regularWords]);
        } else {
          // Check if all regular words are placed
          const regularWords = words.filter(w => !w.isExample);
          const placedRegularWords = Object.values(newColumns).flat().filter(w => !w.isExample);
          
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
        Object.keys(newColumns).forEach((prefix) => {
          newColumns[prefix] = newColumns[prefix].filter(
            (w) => w.id !== wordData.id
          );
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
        prefix: wordData.prefix,
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
    const datetime = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' + 
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0');
    
    const totalTime = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;
    
    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "GreekPrefixGame",
      questions: gameResults,
      totalTime: totalTime
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

  const WordCard = ({ wordData, isDraggable = true }) => (
    <div
      className={`word-card ${isDraggable ? "draggable" : ""} ${wordData.isExample ? "example-word" : ""}`}
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
      {wordData.isExample && <span className="badge bg-warning text-dark me-1">Παράδειγμα</span>}
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
        className={`text-center text-dark ${
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
      <Card.Body className="column-body" onDragOver={handleDragOver}>
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

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
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
        <Col md={12} lg={12}>
          <Card className="main-card">
            <Card.Header className="text-center bg-primary text-white">
              <h4 className="mb-0">
                Βάλε τις λέξεις στη σωστή στήλη
              </h4>
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
                      <Col
                        key={prefix}
                        xs={6}
                        sm={3}
                        md={3}
                        style={{ minWidth: "250px" }}
                      >
                        <PrefixColumn prefix={prefix} words={words} />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GreekWordSortingGame;
