import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import QuestionProgressLights from '../QuestionProgressLights';
import { addReport } from "../../services/reports";

const PrefixSuffixHighlightGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = [
    { word: 'επιτρέπω', prefix: 'επι', stem: 'τρεπ', suffix: 'ω', task: 'prefix', isExample: true },
    { word: 'καταστρέφω', prefix: 'κατα', stem: 'στρεφ', suffix: 'ω', task: 'prefix' },
    { word: 'επιχρωματισμένος', prefix: 'επι', stem: 'χρωματισμεν', suffix: 'ος', task: 'suffix' },
    { word: 'επιλέγω', prefix: 'επι', stem: 'λεγ', suffix: 'ω', task: 'prefix' },
    { word: 'δυσλεξικός', prefix: 'δυσ', stem: 'λεξικ', suffix: 'ός', task: 'suffix' }
  ];

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [highlightPosition, setHighlightPosition] = useState({ start: -1, end: -1 });
  const [feedback, setFeedback] = useState(null);

  // Current word data
  const currentWord = words[currentQuestion];
  const targetPart = currentWord.task === 'prefix' ? currentWord.prefix : currentWord.suffix;

  // Handle answer selection
  const handleAnswerSelect = () => {
    if (!selectedText || selectedAnswer !== null) return;
    
    const isCorrect = selectedText === targetPart;
    setSelectedAnswer(selectedText);
    
    setFeedback({
      isCorrect,
      targetPart: targetPart,
      selectedText
    });

    // If answer is wrong, highlight the correct answer instead
    if (!isCorrect) {
      const word = currentWord.word;
      const correctPart = targetPart;
      const correctIndex = word.toLowerCase().indexOf(correctPart.toLowerCase());
      setHighlightedText(correctPart);
      setHighlightPosition({ start: correctIndex, end: correctIndex + correctPart.length });
    }
    
    const questionEndTime = Date.now();
    const secondsForQuestion = questionStartTime ? Math.round((questionEndTime - questionStartTime) / 1000) : 0;

    // Track the result only for non-example questions
    if (!currentWord.isExample) {
      const taskType = currentWord.task === 'prefix' ? 'πρόθεμα' : 'επίθημα';
      setGameResults((prev) => [
        ...prev,
        {
          question: `${currentWord.word} (${taskType})`,
          result: selectedText,
          target: targetPart,
          isCorrect: isCorrect,
          seconds: secondsForQuestion
        },
      ]);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < words.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(null); // Reset timing for next question
      resetWord();
    } else {
      setGameCompleted(true);
      submitGameResults();
    }
  };

  // Reset word state
  const resetWord = () => {
    setSelectedText('');
    setFeedback(null);
    setHighlightedText('');
    setHighlightPosition({ start: -1, end: -1 });
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
      gameName: "PrefixSuffixHighlightGame",
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
      console.log("Game results submitted successfully");
    } catch (error) {
      console.error("Error submitting game results:", error);
    }
  };

  // Text selection handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString() && selection.rangeCount > 0 && selectedAnswer === null) {
      const selectedText = selection.toString().toLowerCase();
      const word = currentWord.word;
      
      const targetIndex = word.toLowerCase().indexOf(selectedText);
      
      if (targetIndex !== -1) {
        setSelectedText(selectedText);
        setHighlightedText(selectedText);
        setHighlightPosition({ start: targetIndex, end: targetIndex + selectedText.length });
        setFeedback(null);
      }
      
      selection.removeAllRanges();
    }
  };

  // Highlight text function like Game 1
  const highlightText = (text, highlight, position) => {
    if (!highlight || position.start === -1) return text;
    
    const start = Math.max(0, Math.min(position.start, text.length));
    const end = Math.max(start, Math.min(position.end, text.length));
    
    // Use purple for suffix, green for prefix
    const backgroundColor = currentWord.task === 'suffix' ? '#6f42c1' : '#28a745';
    
    return (
      <>
        {text.substring(0, start)}
        <span style={{ backgroundColor: backgroundColor, color: 'white', padding: '2px 4px', borderRadius: '3px' }}>
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };
  
  // Start timing when question begins
  useEffect(() => {
    if (!gameCompleted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, gameCompleted]);

  const getTaskTitle = () => {
    return currentWord.task === 'prefix' 
      ? 'Επιλέξτε το ΠΡΟΘΗΜΑ της λέξης' 
      : 'Επιλέξτε το ΕΠΙΘΗΜΑ της λέξης';
  };

  if (gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center bg-success text-white">
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <QuestionProgressLights
              totalQuestions={words.filter(q => !q.isExample).length}
              currentQuestion={words.filter(q => !q.isExample).length}
              answeredQuestions={gameResults.map(r => r.isCorrect)}
            />
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
      </Container>
    );
  }

  return (
    <Container fluid className="game-container">
      <Row className="justify-content-center">
        <Col md={12} lg={10}>
          {!words[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter(q => !q.isExample).length}
              currentQuestion={currentQuestion - 1}
              answeredQuestions={gameResults.map(r => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className={`text-center ${words[currentQuestion].isExample ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
              <h4 className="mb-0">
                {words[currentQuestion].isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                {getTaskTitle()}
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-4"></div>

              <div className="p-4 bg-light rounded mb-4">
                <div 
                  className="display-4 font-weight-bold mb-3" 
                  style={{ userSelect: "text", cursor: "pointer" }}
                  onMouseUp={handleTextSelection}
                >
                  {highlightedText ? highlightText(currentWord.word, highlightedText, highlightPosition) : currentWord.word}
                </div>

                {feedback && (
                  <div className="mb-4 text-center">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {feedback.isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!feedback && (
                <div className="d-flex gap-3 mt-4 mb-4 justify-content-center">
                  <Button
                    variant={selectedText ? "primary" : "secondary"}
                    size="lg"
                    onClick={handleAnswerSelect}
                    disabled={!selectedText || selectedAnswer !== null}
                  >
                    Υποβολή
                  </Button>
                </div>
              )}

              {/* Next Question Button (only show after feedback) */}
              {feedback && (
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={nextQuestion}
                  >
                    {currentQuestion < words.length - 1 ? 'Επόμενη Λέξη' : 'Ολοκλήρωση'}
                  </Button>
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

};

export default PrefixSuffixHighlightGame;