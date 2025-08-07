import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import QuestionProgressLights from '../QuestionProgressLights';
import { addReport } from "../../services/reports";
import { game5Compounds } from "../Data/Game5";

const WordSeparationGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [separatorPosition, setSeparatorPosition] = useState(null);
  const [gameResults, setGameResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const compounds = useMemo(() => game5Compounds, []);

  // Start timing when question loads
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentWordIndex]);

  const handleSeparatorClick = (position) => {
    if (!isAnswered) {
      setSeparatorPosition(position === separatorPosition ? null : position);
    }
  };

  const handleSubmit = () => {
    const current = compounds[currentWordIndex];
    const correct = separatorPosition === current.correctPosition;

    const selectedWord =
      current.word.slice(0, separatorPosition) +
      "|" +
      current.word.slice(separatorPosition);

    const correctWord =
      current.word.slice(0, current.correctPosition) +
      "|" +
      current.word.slice(current.correctPosition);

    setIsAnswered(true);
    setIsCorrect(correct);
    
    // If wrong, show the correct separator position
    if (!correct) {
      setSeparatorPosition(current.correctPosition);
    }

    // Track the result only for non-example questions
    if (!current.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;
      
      setGameResults((prev) => [
        ...prev,
        {
          question: current.word,
          result: selectedWord,
          target: correctWord,
          isCorrect: correct,
          seconds: secondsForQuestion
        },
      ]);
    }

    setTimeout(() => {
      if (currentWordIndex < compounds.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setSeparatorPosition(null);
        setIsAnswered(false);
        setIsCorrect(false);
        setQuestionStartTime(null); // Reset timing for next question
      } else {
        setShowResults(true);
        submitGameResults();
      }
    }, 1000);
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
    
    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "WordSeparationGame",
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
      // console.log("Game results submitted successfully");
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  };

  const current = compounds[currentWordIndex];

  const renderWord = () => {
    const letters = current.word.split("");
    const spans = [];

    for (let i = 0; i < letters.length; i++) {
      spans.push(
        <span key={`letter-${i}`} className="fs-3 fw-bold text-primary">
          {letters[i]}
        </span>
      );

      if (i < letters.length - 1) {
        spans.push(
          <span
            key={`sep-${i + 1}`}
            onClick={() => handleSeparatorClick(i + 1)}
            className="fs-3 fw-bold cursor-pointer"
            style={{
              width: "20px",
              textAlign: "center",
              color: separatorPosition === i + 1 ? "#dc3545" : "transparent",
              userSelect: "none"
            }}
          >
            |
          </span>
        );
      }
    }

    return (
      <div className="d-flex justify-content-center align-items-center">
        {spans}
      </div>
    );
  };

  if (showResults) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={compounds.filter(c => !c.isExample).length}
              currentQuestion={compounds.filter(c => !c.isExample).length}
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
          {!compounds[currentWordIndex].isExample && (
            <QuestionProgressLights
              totalQuestions={compounds.filter(c => !c.isExample).length}
              currentQuestion={currentWordIndex - 1}
              answeredQuestions={gameResults.map(r => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className={`text-center ${compounds[currentWordIndex].isExample ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
              <h4 className="mb-0">
                {compounds[currentWordIndex].isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Χώρισε τη λέξη
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
          <div className="bg-light p-4 rounded border mb-4">
          <div className="mb-3">{renderWord()}</div>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {!isAnswered ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={separatorPosition === null}
                  className="btn btn-primary px-4 py-2 text-white rounded"
                >
                  Υποβολή
                </button>

                <button
                  onClick={() => setSeparatorPosition(null)}
                  className="btn px-4 py-2 text-white rounded btn-dark"
                >
                  Καθαρισμός
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center">
                <span className="fs-1" style={{ color: isCorrect ? "#28a745" : "#dc3545" }}>
                  {isCorrect ? "✓" : "✗"}
                </span>
              </div>
            )}
          </div>
        </div>


        {/* <div className="text-center">
          <button onClick={resetGame} className="btn btn-secondary px-4 py-2">
            Επανάληψη
          </button>
        </div> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WordSeparationGame;
