import React, { useState } from 'react';
import { Button, Card, ProgressBar, Container, Alert, ListGroup } from 'react-bootstrap';

const RootSuffixGame = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    correctAnswers: 0,
    totalRounds: 6 // matches words.length
  });

  const words = [
    { word: 'τυχαίνω', stem: 'τυχ', suffix: 'αίνω' },
    { word: 'Γράφω', stem: 'Γράφ', suffix: 'ω' },
    { word: 'Διαβάζω', stem: 'Διαβάζ', suffix: 'ω' },
    { word: 'Τρέχω', stem: 'Τρέχ', suffix: 'ω' },
    { word: 'Σχολείο', stem: 'Σχολεί', suffix: 'ο' },
    { word: 'μαθητής', stem: 'μαθητ', suffix: 'ής' }
  ];

  const currentWord = words[currentWordIndex];

  const resetWord = () => {
    setSelectedText('');
    setFeedback(null);
  };

  const submitAnswer = () => {
    if (!selectedText || feedback) return;
    
    const isCorrect = selectedText === currentWord.suffix;
    
    setFeedback({
      isCorrect,
      targetPart: currentWord.suffix,
      selectedText
    });

    // Update game stats
    setGameStats(prev => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          word: currentWord.word,
          target: currentWord.suffix,
          selected: selectedText,
          correct: isCorrect,
          round: currentWordIndex + 1
        }
      ],
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
    }));
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      resetWord();
    } else {
      setGameCompleted(true);
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setSelectedText('');
    setFeedback(null);
    setGameCompleted(false);
    setGameStats({
      rounds: [],
      correctAnswers: 0,
      totalRounds: words.length
    });
  };

  const handleTextSelection = () => {
    if (feedback) return;
    const selection = window.getSelection();
    if (selection.toString()) {
      setSelectedText(selection.toString());
      setFeedback(null);
      selection.removeAllRanges();
    }
  };

  if (gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100" style={{ maxWidth: '600px' }}>
          <Card.Header as="h3" className="text-center bg-purple text-white">
            Αποτελέσματα
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="text-center">
              <h4 className="alert-heading">
                Βαθμολογία: {gameStats.correctAnswers} / {gameStats.totalRounds}
              </h4>
              <p className="mb-0">
                {gameStats.correctAnswers === gameStats.totalRounds 
                  ? 'Τέλεια! Όλα σωστά!'
                  : gameStats.correctAnswers > gameStats.totalRounds / 2
                  ? 'Καλή προσπάθεια!'
                  : 'Μπορείς να τα πας καλύτερα!'}
              </p>
            </Alert>

            <h5 className="mb-3">Λεπτομέρειες:</h5>
            <ListGroup className="mb-4">
              {gameStats.rounds.map((round, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <span>
                      <strong>{round.word}</strong>
                    </span>
                    <span>
                      {round.correct ? (
                        <span className="text-success">✓ Σωστό</span>
                      ) : (
                        <span className="text-danger">✗ Λάθος</span>
                      )}
                    </span>
                  </div>
                  <div className="small text-muted">
                    Επίθημα: <strong>{round.target}</strong> | Επιλογή: <strong>{round.selected}</strong>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" href="/">
                Πίσω στην αρχική
              </Button>
              <Button variant="primary" onClick={restartGame}>
                Νέο Παιχνίδι
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      {/* Exercise Title */}
      <Card className="w-100 mb-4 border-0 bg-transparent">
        <Card.Body className="text-center">
          <Card.Title as="h1" className="text-purple mb-3">
            2 δραστηριότητα: Εξάσκηση στα επιθήματα
          </Card.Title>
          <Card.Text className="lead">
            Επίλεξε τα επιθήματα των παρακάτω λέξεων
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Word Counter */}
      <div className="text-center mb-4">
        <span className="text-muted">
          Λέξη {currentWordIndex + 1} από {words.length}
        </span>
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        now={(currentWordIndex / words.length) * 100} 
        className="w-100 mb-4" 
        label={`${currentWordIndex + 1}/${words.length}`}
      />

      {/* Current Word */}
      <Card className="mb-4 w-100" style={{ maxWidth: '600px' }}>
        <Card.Body className="text-center">
          <div 
            className="display-4 font-weight-bold mb-4 p-4"
            style={{ cursor: 'pointer', userSelect: 'text' }}
            onMouseUp={handleTextSelection}
          >
            {currentWord.word}
          </div>
          
          {selectedText && (
            <div className="mb-4">
              <p className="h5">
                Επιλέξατε: <span className="font-weight-bold text-purple">{selectedText}</span>
              </p>
            </div>
          )}
          
          {feedback && (
            <div className="mb-4">
              <Alert variant={feedback.isCorrect ? "success" : "danger"}>
                <h4 className="mb-0">
                  {feedback.isCorrect ? '✓ Σωστό!' : '✗ Λάθος'}
                </h4>
              </Alert>
              {!feedback.isCorrect && (
                <p className="h5 mt-3">
                  Σωστή απάντηση: <span className="font-weight-bold text-success">{feedback.targetPart}</span>
                </p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex gap-3 mb-4">
        <Button
          variant={selectedText && !feedback ? "success" : "secondary"}
          size="lg"
          onClick={submitAnswer}
          disabled={!selectedText || feedback}
        >
          Υποβολή
        </Button>
        
        <Button
          variant="outline-secondary"
          size="lg"
          onClick={resetWord}
          disabled={!selectedText}
        >
          Επαναφορά
        </Button>
      </div>

      {/* Next Word Button (only show after feedback) */}
      {feedback && (
        <Button
          variant="primary"
          size="lg"
          onClick={nextWord}
        >
          {currentWordIndex < words.length - 1 ? 'Επόμενη Λέξη' : 'Ολοκλήρωση'}
        </Button>
      )}
    </Container>
  );
};

export default RootSuffixGame;