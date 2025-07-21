import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  Container,
  Alert,
  ListGroup,
  Modal,
} from "react-bootstrap";

const GreekReadingExercise = () => {
  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2000); // milliseconds
  const [round, setRound] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    totalWords: 0,
    slowRound: [],
    fastRound: [],
  });

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const wordGroups = [
    {
      stem: "σκούπ-",
      words: ["σκούπα", "σκουπίζω", "σκουπισμένος", "σκουπάκι"],
    },
    {
      stem: "τρύπ-",
      words: ["τρύπα", "τρυπώνω", "τρυπητός", "τρυπημένος"],
    },
  ];

  const allWords = wordGroups.flatMap((group) =>
    group.words.map((word) => ({
      word,
      stem: group.stem,
      suffix: word.normalize("NFD").replace(group.stem.normalize("NFD"), ""),
    }))
  );

  // Initialize game stats
  useEffect(() => {
    setGameStats((prev) => ({ ...prev, totalWords: allWords.length }));
  }, [allWords.length]);

  // Word display timer
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setTimeout(() => {
        // Pause and show approval modal for each word
        setIsRunning(false);
        setShowApprovalModal(true);
      }, speed);
    }
    return () => clearTimeout(interval);
  }, [isRunning, speed, currentWordIndex]);

  const handleEvaluation = (correct) => {
    // const roundType = round === 1 ? "slowRound" : "fastRound";

    // Create evaluation object with all needed info
    const evaluation = {
      word: allWords[currentWordIndex].word,
      correct,
      round,
      speed,
      timestamp: new Date().toISOString(),
    };

    setGameStats((prev) => {
      // Create copies of the rounds to avoid mutation
      const slowRound = [...prev.slowRound];
      const fastRound = [...prev.fastRound];

      // Update the appropriate round
      if (round === 1) {
        slowRound[currentWordIndex] = evaluation;
      } else {
        fastRound[currentWordIndex] = evaluation;
      }

      // Calculate total correct answers
      const totalCorrect = [
        ...slowRound.filter((r) => r?.correct),
        ...fastRound.filter((r) => r?.correct),
      ].length;

      return {
        ...prev,
        slowRound,
        fastRound,
        totalCorrect,
        totalWords: allWords.length * 2, // 2 rounds
      };
    });

    setShowApprovalModal(false);

    // Move to next word or round
    if (currentWordIndex < allWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsRunning(true);
    } else if (round === 1) {
      // Start fast round
      setRound(2);
      setCurrentWordIndex(0);
      setSpeed(1000);
      setIsRunning(true);
    } else {
      setGameCompleted(true);
      if (isRecording) stopRecording();
    }
  };

  // Audio recording functions
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
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());

      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setIsRecording(false);
    }
  };

  const startExercise = () => {
    setCurrentWordIndex(0);
    setRound(1);
    setSpeed(2000);
    setIsRunning(true);
    setGameCompleted(false);
    setGameStats({
      slowRound: Array(allWords.length).fill(null),
      fastRound: Array(allWords.length).fill(null),
      totalCorrect: 0,
      totalWords: allWords.length * 2,
    });
  };

  const resetExercise = () => {
    setIsRunning(false);
    setCurrentWordIndex(0);
    setRound(1);
    setSpeed(2000);
    setGameCompleted(false);
    setAudioBlob(null);
  };

  const AudioPlayer = () => {
    return (
      <div className="mt-3">
        <audio
          controls
          src={audioBlob ? URL.createObjectURL(audioBlob) : null}
          onEnded={(e) => URL.revokeObjectURL(e.target.src)}
        />
      </div>
    );
  };

  const getDisplayWord = (wordObj, showStem) => {
    if (showStem) {
      return (
        <>
          <span className="text-primary">{wordObj.word}</span>
        </>
      );
    }
    return <span className="text-primary">{wordObj.word}</span>;
  };

  // Approval Modal
  const ApprovalModal = () => (
    <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Επιβεβαίωση Ανάγνωσης</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Ο μαθητής/τρια διάβασε σωστά τη λέξη "{allWords[currentWordIndex]?.word}
        ";
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => handleEvaluation(true)}>
          Σωστό
        </Button>
        <Button variant="danger" onClick={() => handleEvaluation(false)}>
          Λάθος
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (gameCompleted) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card
          className="w-100"
          style={{ maxWidth: "800px", overflowY: "scroll" }}
        >
          <Card.Header as="h3" className="text-center bg-success text-white">
            Αποτελέσματα
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="text-center">
              <h4 className="alert-heading">
                Βαθμολογία: {gameStats.totalCorrect} / {gameStats.totalWords}
              </h4>
            </Alert>

            <h4 className="mb-3">1ος Γύρος (Αργά):</h4>
            <ListGroup className="mb-4">
              {allWords.map((word, index) => (
                <ListGroup.Item key={`slow-${index}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{word.word}</span>
                    {gameStats.slowRound[index] ? (
                      gameStats.slowRound[index].correct ? (
                        <span className="text-success">✓ Σωστό</span>
                      ) : (
                        <span className="text-danger">✗ Λάθος</span>
                      )
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <h4 className="mb-3">2ος Γύρος (Γρήγορα):</h4>
            <ListGroup className="mb-4">
              {allWords.map((word, index) => (
                <ListGroup.Item key={`fast-${index}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{word.word}</span>
                    {gameStats.fastRound[index] ? (
                      gameStats.fastRound[index].correct ? (
                        <span className="text-success">✓ Σωστό</span>
                      ) : (
                        <span className="text-danger">✗ Λάθος</span>
                      )
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {audioBlob && (
              <div className="mb-4">
                <h5>Ηχογράφηση:</h5>
                <AudioPlayer />
              </div>
            )}

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" href="/">
                Πίσω στην αρχική
              </Button>
              <Button variant="success" onClick={resetExercise}>
                Νέα Άσκηση
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center full-height">
      <Card className="w-100 mb-4 border-0 bg-transparent">
        <Card.Body className="text-center">
          <Card.Title as="h1" className="text-success mb-3">
            3η δραστηριότητα: Ανάγνωση με τη βοήθεια των βάσεων
          </Card.Title>
          <Card.Text className="lead">
            Διάβασε όσο πιο γρήγορα και καλά μπορείς τις παρακάτω λέξεις:
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="w-100 mb-4" style={{ maxWidth: "800px" }}>
        <Card.Body className="text-center">
          <div className="mb-4">
            <span className="text-muted">Ταχύτητα: {speed / 1000}s</span>
          </div>

          <div
            className="p-4 border rounded bg-light mb-4"
            style={{
              minHeight: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isRunning || showApprovalModal ? (
              <div className="text-center">
                <div className="display-4 font-weight-bold mb-2">
                  {getDisplayWord(
                    allWords[currentWordIndex],
                    currentWordIndex % 4 < 2
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted">
                Πατήστε "Έναρξη" για να αρχίσει η άσκηση
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center gap-3 mb-4">
            <Button
              variant="success"
              onClick={startExercise}
              disabled={isRunning}
            >
              Έναρξη
            </Button>
            <Button variant="secondary" onClick={resetExercise}>
              Επαναφορά
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="w-100 mb-4" style={{ maxWidth: "800px" }}>
        <Card.Body className="text-center">
          <Button
            variant={isRecording ? "danger" : "primary"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className="rounded-circle p-3 mb-2"
          >
            <i
              className={`bi bi-${isRecording ? "stop" : "mic"}-fill`}
              style={{ fontSize: "1.5rem" }}
            ></i>
          </Button>
          <Card.Text className="text-muted small">
            Κάντε κλικ για να ηχογραφήσετε την ανάγνωσή σας
          </Card.Text>
          {audioBlob && <AudioPlayer />}
        </Card.Body>
      </Card>

      <Card className="w-100" style={{ maxWidth: "800px" }}>
        <Card.Body>
          <Card.Title as="h5">Οδηγίες:</Card.Title>
          <Card.Text className="text-muted">
            Η βάση παραμένει σταθερή και αλλάζουν μόνο τα παραγωγικά επιθήματα.
            Στον πρώτο γύρο οι λέξεις εμφανίζονται αργά, στον δεύτερο πιο
            γρήγορα.
          </Card.Text>
        </Card.Body>
      </Card>

      <ApprovalModal />
    </Container>
  );
};

export default GreekReadingExercise;
