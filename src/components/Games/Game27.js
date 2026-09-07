import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/Game.css";
import "../../styles/Game6.css";
import { addReport } from "../../services/reports";
import { game27Words } from "../Data/Game27Data";
import useAudio from "../../hooks/useAudio";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

const CATEGORIES = ["ΣΧΟΛΕΙΟ", "ΘΑΛΑΣΣΑ", "ΒΟΥΝΟ", "ΓΙΟΡΤΗ"];

const emptyColumns = () => Object.fromEntries(CATEGORIES.map((category) => [category, []]));

const getCategoryColor = (category) => {
  const colors = {
    ΣΧΟΛΕΙΟ: "#FFF8DC",
    ΘΑΛΑΣΣΑ: "#FFEB3B",
    ΒΟΥΝΟ: "#FFD700",
    ΓΙΟΡΤΗ: "#FFA500",
  };
  return colors[category] || "#FFF8DC";
};

const getCategoryBorderColor = (category) => {
  const colors = {
    ΣΧΟΛΕΙΟ: "#DDD8B8",
    ΘΑΛΑΣΣΑ: "#F9C842",
    ΒΟΥΝΟ: "#E6C200",
    ΓΙΟΡΤΗ: "#E6941A",
  };
  return colors[category] || "#DDD8B8";
};

const Game27 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();

  const words = useMemo(() => {
    const examples = game27Words.filter((w) => w.isExample);
    const nonExamples = game27Words.filter((w) => !w.isExample);

    // Shuffle non-examples using Fisher-Yates algorithm
    const shuffled = [...nonExamples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return [...examples, ...shuffled];
  }, []);

  // Ένα παράδειγμα μπαίνει στο παιχνίδι μόνο αφού οριστεί ο κόσμος του
  const exampleWords = useMemo(() => words.filter((w) => w.isExample && w.category), [words]);
  const regularWords = useMemo(() => words.filter((w) => !w.isExample), [words]);

  const [wordPool, setWordPool] = useState([]);
  const [columns, setColumns] = useState(emptyColumns);
  const [wordAttempts, setWordAttempts] = useState({});
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  useEffect(() => {
    const audio = practiceEndAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setWaitingForPracticeEnd(false);
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [practiceEndAudioRef]);

  const initializeGame = React.useCallback(() => {
    setWordPool(exampleWords.length ? exampleWords : regularWords);
    setColumns(emptyColumns());
    setWordAttempts({});
    setGameStartTime(Date.now());
    setGameResults([]);
    setGameCompleted(false);
  }, [exampleWords, regularWords]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Μόλις τοποθετηθούν όλα τα παραδείγματα, ακούγεται το μήνυμα λήξης της εξάσκησης
  const finishPractice = () => {
    setWaitingForPracticeEnd(true);
    setTimeout(() => {
      practiceEndAudioRef.current
        .play()
        .then(() => {
          setWordPool((prev) => [...prev, ...regularWords]);
        })
        .catch((error) => {
          console.error("Error playing end of practice audio:", error);
          setWordPool((prev) => [...prev, ...regularWords]);
          setWaitingForPracticeEnd(false);
        });
    }, 100);
  };

  const handleDragStart = (e, wordData) => {
    if (waitingForPracticeEnd) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", JSON.stringify(wordData));
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Τοποθετεί τη λέξη στη στήλη της και προχωράει το παιχνίδι
  const placeWord = (wordData, targetCategory, score) => {
    if (!wordData.isExample) {
      setGameResults((prev) => [...prev, { question: wordData.word, result: score, target: 1, isCorrect: score === 1 }]);
    }

    setWordPool((prev) => prev.filter((w) => w.id !== wordData.id));

    const newColumns = { ...columns };
    CATEGORIES.forEach((category) => {
      newColumns[category] = newColumns[category].filter((w) => w.id !== wordData.id);
    });
    newColumns[targetCategory] = [...newColumns[targetCategory], { ...wordData, placedCategory: targetCategory }];
    setColumns(newColumns);

    const placed = Object.values(newColumns).flat();

    if (wordData.isExample) {
      if (placed.filter((w) => w.isExample).length === exampleWords.length) {
        finishPractice();
      }
    } else if (placed.filter((w) => !w.isExample).length === regularWords.length) {
      setTimeout(() => setGameCompleted(true), 500);
    }
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();

    const wordData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (!wordData) return;

    const newAttempts = (wordAttempts[wordData.id] || 0) + 1;
    setWordAttempts((prev) => ({ ...prev, [wordData.id]: newAttempts }));

    if (wordData.category === targetCategory) {
      placeWord(wordData, targetCategory, newAttempts);
    } else if (newAttempts >= 2) {
      // Μετά από δύο λάθος προσπάθειες η λέξη μπαίνει μόνη της στη σωστή στήλη
      placeWord(wordData, wordData.category, 3);
    }
  };

  const submitGameResults = async () => {
    if (!studentId || !classId) {
      console.error("Missing required data for report submission");
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

    const results = {
      datetime: datetime,
      gameName: "FourWorldsSortingGame",
      questions: gameResults,
      totalTime: gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0,
    };

    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results),
      });
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  };

  useEffect(() => {
    if (gameCompleted && gameResults.length > 0) {
      submitGameResults();
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted, gameResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const WordCard = ({ wordData, isDraggable = true }) => (
    <div
      className={`word-card ${isDraggable ? "draggable" : ""} ${wordData.isExample ? "example-word" : ""}`}
      style={
        !isDraggable && wordData.placedCategory
          ? {
              backgroundColor: getCategoryColor(wordData.placedCategory),
              border: `2px solid ${getCategoryBorderColor(wordData.placedCategory)}`,
              color: "black",
            }
          : {}
      }
      draggable={isDraggable && !waitingForPracticeEnd}
      onDragStart={isDraggable ? (e) => handleDragStart(e, wordData) : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
    >
      {wordData.isExample && <div className="example-badge-drag">Παράδειγμα</div>}
      {wordData.word}
    </div>
  );

  const CategoryColumn = ({ category, words: columnWords }) => (
    <Card
      className="prefix-column"
      style={{
        border: `3px solid ${getCategoryBorderColor(category)}`,
        backgroundColor: `${getCategoryColor(category)}20`,
      }}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, category)}
    >
      <Card.Header
        className="text-center"
        style={{
          backgroundColor: getCategoryColor(category),
          color: "black",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        {category}
      </Card.Header>
      <Card.Body className="column-body" onDragOver={handleDragOver}>
        {columnWords.map((wordData) => (
          <WordCard key={`${wordData.id}-${category}`} wordData={wordData} isDraggable={false} />
        ))}
      </Card.Body>
    </Card>
  );

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered-tall">
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
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <Row className="game-row-centered-tall">
        <Col md={12} lg={12}>
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0">Τοποθετώ την κάθε λέξη στον κόσμο όπου ανήκει</h4>
            </Card.Header>
            <Card.Body>
              <Row>
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

                <Col md={10} lg={10}>
                  <Row className="flex-nowrap overflow-auto mb-4">
                    {CATEGORIES.map((category) => (
                      <Col key={category} xs={6} sm={3} md={3} style={{ minWidth: "250px" }}>
                        <CategoryColumn category={category} words={columns[category]} />
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

export default Game27;
