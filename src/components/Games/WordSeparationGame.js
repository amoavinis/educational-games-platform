import React, { useState } from "react";
import { Container, Card, Alert, ListGroup, Button } from "react-bootstrap";

const WordSeparationGame = () => {
  const [feedback, setFeedback] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [separatorPosition, setSeparatorPosition] = useState(null);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const compounds = [
    { word: "σπιτόγατος", correctPosition: 5 },
    { word: "ανθρωποφάγος", correctPosition: 7 },
    { word: "αυτοκίνητο", correctPosition: 4 },
    { word: "φωτογραφία", correctPosition: 4 },
    { word: "τηλεόραση", correctPosition: 4 },
  ];

  const handleSeparatorClick = (position) => {
    setSeparatorPosition(position === separatorPosition ? null : position);
    setFeedback("");
  };

  const handleSubmit = () => {
    const current = compounds[currentWordIndex];
    const isCorrect = separatorPosition === current.correctPosition;

    const selectedWord =
      current.word.slice(0, separatorPosition) +
      "|" +
      current.word.slice(separatorPosition);

    const correctWord =
      current.word.slice(0, current.correctPosition) +
      "|" +
      current.word.slice(current.correctPosition);

    setFeedback(isCorrect ? "Σωστό! 🎉" : "Λάθος.");
    setResults([
      ...results,
      {
        word: current.word,
        isCorrect,
        selectedWord,
        correctWord,
      },
    ]);

    setTimeout(() => {
      if (currentWordIndex < compounds.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setSeparatorPosition(null);
        setFeedback("");
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const handleHint = () => {
    const current = compounds[currentWordIndex];
    const correctPosition = current.correctPosition;

    const correctWord =
      current.word.slice(0, correctPosition) +
      "|" +
      current.word.slice(correctPosition);

    const selectedWord = correctWord + "(Είδε τη λύση)";

    setFeedback("Η σωστή απάντηση εμφανίστηκε.");
    setResults([
      ...results,
      {
        word: current.word,
        isCorrect: false,
        selectedWord,
        correctWord,
      },
    ]);

    setTimeout(() => {
      if (currentWordIndex < compounds.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        setSeparatorPosition(null);
        setFeedback("");
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setSeparatorPosition(null);
    setFeedback("");
    setResults([]);
    setShowResults(false);
  };

  const current = compounds[currentWordIndex];

  const renderWord = () => {
    const letters = current.word.split("");
    const spans = [];

    for (let i = 0; i < letters.length; i++) {
      spans.push(
        <span key={`letter-${i}`} className="fs-3 fw-bold text-primary px-1">
          {letters[i]}
        </span>
      );

      if (i < letters.length - 1) {
        spans.push(
          <span
            key={`sep-${i + 1}`}
            onClick={() => handleSeparatorClick(i + 1)}
            className={`fs-3 fw-bold px-1 cursor-pointer ${
              separatorPosition === i + 1 ? "text-danger" : "text-secondary"
            }`}
          >
            |
          </span>
        );
      }
    }

    return (
      <div className="d-flex justify-content-center flex-wrap gap-2">
        {spans}
      </div>
    );
  };

  if (showResults) {
    const score = results.filter((r) => r.isCorrect).length;

    return (
      <Container
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ overflowY: "scroll" }}
      >
        <Card className="w-100" style={{ maxWidth: "800px" }}>
          <Card.Header as="h3" className="text-center bg-primary text-white">
            Αποτελέσματα
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="text-center">
              <h4 className="alert-heading">
                Τελικό Σκορ: {score}/{compounds.length}
              </h4>
              <p className="mb-0">
                {score === compounds.length
                  ? "Τέλεια απόδοση!"
                  : score > compounds.length / 2
                  ? "Καλή προσπάθεια!"
                  : "Μπορείς να τα πας καλύτερα!"}
              </p>
            </Alert>

            <h5 className="mb-3">Λεπτομέρειες:</h5>
            <ListGroup className="mb-4">
              {results.map((result, index) => (
                <ListGroup.Item key={index}>
                  <div className="mb-2">
                    <strong>{result.word}</strong>
                  </div>
                  <div
                    className={
                      result.isCorrect ? "text-success" : "text-danger"
                    }
                  >
                    Επιλογή: {result.selectedWord}
                  </div>
                  {!result.isCorrect && (
                    <div className="text-success">
                      Σωστό: {result.correctWord}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" href="/">
                Πίσω στην αρχική
              </Button>
              <Button variant="primary" onClick={resetGame}>
                Νέα Άσκηση
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 text-primary">
        5η δραστηριότητα: Διαχωρισμός σύνθετων λέξεων
      </h1>

      <div className="mb-4 p-3 bg-light border rounded">
        <p className="fs-5 text-dark mb-2">
          Χώρισε τις σύνθετες λέξεις σου βάζοντας κάθετες γραμμές με ποντικί
          σου.
        </p>
        <p className="text-muted small">π.χ. σπιτόγατος = σπιτό|γατος</p>
      </div>

      <div className="text-center mb-5">
        <div className="text-muted small mb-3">
          {currentWordIndex === 0
            ? "Δοκιμή"
            : `Λέξη ${currentWordIndex} από ${compounds.length - 1}`}
        </div>

        <div className="bg-light p-4 rounded border mb-4">
          <div className="mb-3">{renderWord()}</div>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              onClick={handleSubmit}
              disabled={separatorPosition === null}
              className="btn btn-primary px-4 py-2 text-white rounded"
            >
              Υποβολή
            </button>

            <button
              onClick={handleHint}
              className="btn px-4 py-2 text-white rounded btn-warning"
            >
              Δείξε Λύση
            </button>

            <button
              onClick={() => setSeparatorPosition(null)}
              className="btn px-4 py-2 text-white rounded btn-dark"
            >
              Καθαρισμός
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`alert ${
              feedback.includes("Σωστό")
                ? "alert-success"
                : feedback.includes("Λάθος")
                ? "alert-danger"
                : "alert-info"
            }`}
          >
            {feedback}
          </div>
        )}

        {/* <div className="text-center">
          <button onClick={resetGame} className="btn btn-secondary px-4 py-2">
            Επανάληψη
          </button>
        </div> */}
      </div>

      <div className="mt-5 p-3 bg-info bg-opacity-10 border-start border-info border-3 rounded">
        <h3 className="fs-5 fw-bold text-info mb-2">Επιπλέον οδηγίες:</h3>
        <ul className="small text-secondary ps-3">
          <li>
            Κάντε κλικ μεταξύ των γραμμάτων για να τοποθετήσετε διαχωριστικό "|"
          </li>
          <li>Κάντε ξανά κλικ στο "|" για να το αφαιρέσετε</li>
          <li>Διαχωρίστε τη σύνθετη λέξη στα δύο μέρη της</li>
          <li>Πατήστε "Υποβολή" όταν τελειώσετε</li>
        </ul>
      </div>
    </div>
  );
};

export default WordSeparationGame;
