import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Container, ProgressBar } from "react-bootstrap";
import "../../styles/Game.css";

const SyllableReadingGame = () => {
  // Greek words with syllables
  const words = [
    {
      word: "καταστρέφω",
      syllables: ["κα", "τα", "στρέ", "φω"],
      fullWord: "καταστρέφω"
    },
    {
      word: "επιχρωματισμένος",
      syllables: ["ε", "πι", "χρω", "μα", "τι", "σμέ", "νος"],
      fullWord: "επιχρωματισμένος"
    },
    {
      word: "ανατρεπόμενη",
      syllables: ["α", "να", "τρε", "πό", "με", "νη"],
      fullWord: "ανατρεπόμενη"
    },
    {
      word: "δυσλειτουργία",
      syllables: ["δυσ", "λει", "τουρ", "γί", "α"],
      fullWord: "δυσλειτουργία"
    },
    {
      word: "προκαταρκτικός",
      syllables: ["προ", "κα", "ταρ", "κτι", "κός"],
      fullWord: "προκαταρκτικός"
    }
  ];

  // Game states
  const [gameState, setGameState] = useState("waiting"); // 'waiting', 'playing', 'evaluation', 'completed'
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [timer, setTimer] = useState(3);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState([]); // Store evaluation results
  
  // Audio recording refs
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  
  // Current word data
  const currentWord = words[currentWordIndex];
  const currentSyllable = currentWord.syllables[currentSyllableIndex];
  const isLastSyllable = currentSyllableIndex === currentWord.syllables.length - 1;
  
  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.start(250);
      setIsRecording(true);
      setGameState("playing");
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());

      // Create final blob when recording stops
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setIsRecording(false);
    }
  };

  // Timer for syllable display
  useEffect(() => {
    let interval;
    
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Move to next syllable or word
            if (currentSyllableIndex < currentWord.syllables.length - 1) {
              setCurrentSyllableIndex(currentSyllableIndex + 1);
              return 3; // Reset timer for next syllable
            } else {
              // Finished all syllables - show full word
              setGameState("evaluation");
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, currentSyllableIndex, currentWordIndex, currentWord.syllables.length]);

  // Handle evaluation
  const handleEvaluation = (correct) => {
    const newEvaluation = [...evaluation, {
      word: currentWord.word,
      correct,
      index: currentWordIndex
    }];
    
    setEvaluation(newEvaluation);
    
    // Move to next word or finish game
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentSyllableIndex(0);
      setTimer(3);
      setGameState("playing");
    } else {
      stopRecording();
      setGameState("completed");
      /* reportFn({
        words,
        evaluation: newEvaluation,
        audioBlob
      }); */
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState("waiting");
    setCurrentWordIndex(0);
    setCurrentSyllableIndex(0);
    setTimer(3);
    setAudioBlob(null);
    setIsRecording(false);
    setEvaluation([]);
  };

  // Audio player component
  const AudioPlayer = () => {
    return (
      <div className="mt-4">
        <h4>Your Recording:</h4>
        <audio
          controls
          src={audioBlob ? URL.createObjectURL(audioBlob) : ""}
          onEnded={(e) => URL.revokeObjectURL(e.target.src)}
          className="w-100"
        />
      </div>
    );
  };

  // Calculate progress
  const totalSyllables = words.reduce((sum, word) => sum + word.syllables.length, 0);
  const completedSyllables = words.slice(0, currentWordIndex).reduce(
    (sum, word) => sum + word.syllables.length, 
    currentSyllableIndex
  );
  const progress = (completedSyllables / totalSyllables) * 100;

  // Render game screen
  if (gameState === "waiting") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Ανάγνωση Συλλαβών</h2>
        <p className="text-center mb-4">
          Το παιχνίδι θα εμφανίζει συλλαβές από ελληνικές λέξεις. <br />
          Διαβάστε δυνατά κάθε συλλαβή καθώς εμφανίζεται. <br />
          Στο τέλος κάθε λέξης, θα εμφανιστεί ολόκληρη η λέξη.
        </p>
        
        <Button variant="primary" onClick={startRecording} className="mb-3">
          Έναρξη και Ηχογράφηση
        </Button>
      </Container>
    );
  }

  if (gameState === "playing") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Διαβάστε τη Συλλαβή</h2>
        
        <ProgressBar
          now={progress}
          label={`${Math.round(progress)}%`}
          className="w-100 mb-4"
        />
        
        <div className="mb-3">
          <h3 className={timer > 0 ? "text-primary" : "text-danger"}>
            {timer}s
          </h3>
        </div>
        
        <div className="mb-4 text-center">
          <div className="display-4 font-weight-bold mb-3">
            {currentSyllable}
          </div>
          <p>
            Λέξη {currentWordIndex + 1} από {words.length}
            <br />
            Συλλαβή {currentSyllableIndex + 1} από {currentWord.syllables.length}
          </p>
        </div>
        
        {/* Full word display after last syllable */}
        {isLastSyllable && (
          <div className="mb-4 p-3 border border-success rounded">
            <h4>Ολόκληρη η λέξη:</h4>
            <div className="display-4 text-success">
              {currentWord.fullWord}
            </div>
          </div>
        )}
        
        <div className="d-flex gap-3 mt-4">
          {!isRecording ? (
            <Button variant="primary" onClick={startRecording}>
              Έναρξη Ηχογράφησης
            </Button>
          ) : (
            <div className="text-danger d-flex align-items-center">
              <strong>Γίνεται ηχογράφηση...</strong>
            </div>
          )}
          
          {isRecording && (
            <Button variant="warning" onClick={stopRecording}>
              Διακοπή Ηχογράφησης
            </Button>
          )}
        </div>
      </Container>
    );
  }

  if (gameState === "evaluation") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Αξιολόγηση Ανάγνωσης</h2>
        
        <div className="text-center mb-5">
          <h3 className="mb-3">Λέξη: {currentWord.fullWord}</h3>
          <p>Ο παίκτης την διάβασε σωστά;</p>
        </div>
        
        <div className="d-flex gap-3">
          <Button 
            variant="success" 
            size="lg"
            onClick={() => handleEvaluation(true)}
          >
            Ναι, Σωστά
          </Button>
          <Button 
            variant="danger" 
            size="lg"
            onClick={() => handleEvaluation(false)}
          >
            Όχι, Λάθος
          </Button>
        </div>
      </Container>
    );
  }

  // Completed game state
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Header as="h3">Αποτελέσματα</Card.Header>
        <Card.Body>
          <p className="h4 text-center mb-4">
            Ολοκληρώσατε την ανάγνωση {words.length} λέξεων!
          </p>
          
          <div className="mb-4">
            <h5>Αποτελέσματα ανάγνωσης:</h5>
            <ul className="list-group">
              {evaluation.map((result, index) => (
                <li 
                  key={index} 
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    result.correct ? 'list-group-item-success' : 'list-group-item-danger'
                  }`}
                >
                  <div>
                    <strong>{words[result.index].fullWord}</strong>
                  </div>
                  <div>
                    {result.correct ? (
                      <span className="text-success">✓ Σωστά</span>
                    ) : (
                      <span className="text-danger">✗ Λάθος</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center mb-4">
            <h5>
              Συνολική επίδοση:{" "}
              {evaluation.filter(r => r.correct).length} / {words.length}
            </h5>
          </div>
          
          {audioBlob && <AudioPlayer />}
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" href="/">
              Αρχική Σελίδα
            </Button>
            <Button variant="primary" onClick={resetGame}>
              Παίξτε Ξανά
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SyllableReadingGame;