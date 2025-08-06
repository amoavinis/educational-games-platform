import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import QuestionProgressLights from '../QuestionProgressLights';
import { addReport } from '../../services/reports';

const WordHighlightGame = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [highlightedText, setHighlightedText] = useState('');
  const [highlightPosition, setHighlightPosition] = useState({ start: -1, end: -1 });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    correctAnswers: 0,
    totalRounds: 0
  });
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const words = useMemo(() => [
    { word: 'παίζω', stem: 'παίζ', suffix: 'ω', isExample: true }, // Example question
    { word: 'τυχαίνω', stem: 'τυχ', suffix: 'αίνω' },
    { word: 'Γράφω', stem: 'Γράφ', suffix: 'ω' },
    { word: 'Διαβάζω', stem: 'Διαβάζ', suffix: 'ω' },
    { word: 'Τρέχω', stem: 'Τρέχ', suffix: 'ω' },
    { word: 'Σχολείο', stem: 'Σχολεί', suffix: 'ο' },
    { word: 'μαθητής', stem: 'μαθητ', suffix: 'ής' }
  ], []);

  // Initialize game stats
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats(prev => ({ ...prev, totalRounds: words.filter(w => !w.isExample).length }));
      setQuestionStartTime(Date.now());
    }
  }, [gameStats.totalRounds, words]);

  const currentWord = words[currentWordIndex];

  const resetWord = () => {
    setSelectedText('');
    setFeedback(null);
    setHighlightedText('');
    setHighlightPosition({ start: -1, end: -1 });
  };

  const submitAnswer = () => {
    if (!selectedText) return;
    
    const isCorrect = selectedText === currentWord.stem;
    
    setFeedback({
      isCorrect,
      targetPart: currentWord.stem,
      selectedText
    });

    // If answer is wrong, highlight the correct answer instead
    if (!isCorrect) {
      const word = currentWord.word;
      const stem = currentWord.stem;
      const correctIndex = word.indexOf(stem); // Use indexOf for stem (usually at beginning)
      setHighlightedText(stem);
      setHighlightPosition({ start: correctIndex, end: correctIndex + stem.length });
    }
    // If correct, keep the user's selection highlighted

    // Update game stats only for non-example questions
    if (!currentWord.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? Math.round((questionEndTime - questionStartTime) / 1000) : 0;
      
      setGameStats(prev => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: currentWord.word,
            target: currentWord.stem,
            result: selectedText,
            isCorrect: isCorrect,
            seconds: secondsForQuestion
          }
        ],
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
      }));
    }
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      resetWord();
      setQuestionStartTime(Date.now());
    } else {
      setGameCompleted(true);
      submitGameResults({ gameStats });
    }
  };

  // Submit game results function
  const submitGameResults = async (gameData) => {
    if (!studentId || !classId) {
      console.error('Missing required data for report submission');
      return;
    }

    const now = new Date();
    const datetime = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' + 
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0');
    
    const results = {
      datetime: datetime,
      gameName: "WordHighlightGame",
      questions: gameData.gameStats.rounds
    };
    
    try {
      await addReport({
        schoolId,
        studentId,
        classId,
        gameId,
        results: JSON.stringify(results)
      });
      console.log('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };


  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString() && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      const word = currentWord.word;
      
      // For stems, we usually want the first occurrence
      const targetIndex = word.indexOf(selectedText);
      
      if (targetIndex !== -1) {
        setSelectedText(selectedText);
        setHighlightedText(selectedText);
        setHighlightPosition({ start: targetIndex, end: targetIndex + selectedText.length });
        setFeedback(null);
      }
      
      selection.removeAllRanges();
    }
  };

  const highlightText = (text, highlight, position) => {
    if (!highlight || position.start === -1) return text;
    
    // Ensure position is within bounds
    const start = Math.max(0, Math.min(position.start, text.length));
    const end = Math.max(start, Math.min(position.end, text.length));
    
    return (
      <>
        {text.substring(0, start)}
        <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 4px', borderRadius: '3px' }}>
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="justify-content-center">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={gameStats.totalRounds}
              currentQuestion={gameStats.totalRounds}
              answeredQuestions={gameStats.rounds.map(r => r.isCorrect)}
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
          {!currentWord.isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter(w => !w.isExample).length}
              currentQuestion={currentWordIndex - 1}
              answeredQuestions={gameStats.rounds.map(r => r.isCorrect)}
            />
          )}
          <Card className="main-card">
            <Card.Header className={`text-center ${currentWord.isExample ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
              <h4 className="mb-0">
                {currentWord.isExample && <span className="badge badge-dark me-2">Παράδειγμα</span>}
                Υπογράμμισε τη βάση
              </h4>
            </Card.Header>
            <Card.Body className="text-center">
          <div 
            className="display-4 font-weight-bold mb-4 p-4"
            style={{ cursor: 'pointer', userSelect: 'text' }}
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
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          {!feedback && <div className="d-flex gap-3 mt-4 mb-4 justify-content-center">
            <Button
              variant={selectedText ? "primary" : "secondary"}
              size="lg"
              onClick={submitAnswer}
              disabled={!selectedText || feedback}
            >
              Υποβολή
            </Button>
            
          </div>}

          {/* Next Word Button (only show after feedback) */}
          {feedback && (
            <div className="text-center mt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={nextWord}
              >
                {currentWordIndex < words.length - 1 ? 'Επόμενη Λέξη' : 'Ολοκλήρωση'}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default WordHighlightGame;