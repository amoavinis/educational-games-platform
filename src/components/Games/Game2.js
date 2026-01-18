// Game 2
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game2Words } from "../Data/Game2Data";
import useAudio from "../../hooks/useAudio";
import titleInstructionsAudio from "../../assets/sounds/02/title-instructions.mp3";
import exampleIzoAudio from "../../assets/sounds/02/example-ιζω.mp3";
import exampleOnoAudio from "../../assets/sounds/02/example-ωνω.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

const Game2 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [highlightPosition, setHighlightPosition] = useState({
    start: -1,
    end: -1,
  });
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState({
    rounds: [],
    correctAnswers: 0,
    totalRounds: 0,
  });
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isInitialAudioPlaying, setIsInitialAudioPlaying] = useState(true);
  const [isWordAudioPlaying, setIsWordAudioPlaying] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [hasPlayedInitialAudio, setHasPlayedInitialAudio] = useState(false);

  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  const words = useMemo(() => game2Words, []);

  // Map words to their audio files (only for examples)
  const wordAudioMap = useMemo(
    () => ({
      καθαρίζω: exampleIzoAudio,
      κλειδώνω: exampleOnoAudio,
    }),
    []
  );

  // Initial title-instructions audio (plays on load)
  const { audioRef: titleAudioRef, audioSrc: titleAudioSrc } = useAudio(titleInstructionsAudio, {
    playOnMount: false,
  });

  const { audioRef: practiceEndAudioRef, audioSrc: practiceEndAudioSrc } = useAudio(practiceEnd, {
    playOnMount: false,
  });

  // Word-specific audio (plays after submission for example words)
  const {
    audioRef: wordAudioRef,
    audioSrc: wordAudioSrc,
    play: playWordAudio,
  } = useAudio(currentWordAudio, {
    playOnMount: false,
  });

  // Play initial audio once on mount
  useEffect(() => {
    if (!hasPlayedInitialAudio && titleAudioRef.current) {
      const timer = setTimeout(() => {
        titleAudioRef.current
          .play()
          .then(() => {
            setHasPlayedInitialAudio(true);
          })
          .catch((error) => {
            console.error("Error playing title audio:", error);
            setIsInitialAudioPlaying(false);
            setHasPlayedInitialAudio(true);
          });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasPlayedInitialAudio, titleAudioRef]);

  const currentWord = words[currentWordIndex];

  // Listen for title audio ended
  useEffect(() => {
    const audio = titleAudioRef.current;
    const handleEnded = () => {
      setIsInitialAudioPlaying(false);

      const wordIdx = words.findIndex((w) => w.word === currentWord.word);
      if (currentWord.isExample && !words[wordIdx + 1]?.isExample) {
        setWaitingForPracticeEnd(true);

        const timer = setTimeout(() => {
          practiceEndAudioRef.current
            .play()
            .then(() => {})
            .catch((error) => {
              console.error("Error playing end of practice audio:", error);
            });
        }, 100);

        return () => clearTimeout(timer);
      }
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentWord.isExample, currentWord.word, practiceEndAudioRef, titleAudioRef, words]);

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

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      setIsWordAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [wordAudioRef]);

  // Initialize game stats and start time
  useEffect(() => {
    if (gameStats.totalRounds === 0) {
      setGameStats((prev) => ({
        ...prev,
        totalRounds: words.filter((w) => !w.isExample).length,
      }));
      setQuestionStartTime(Date.now());
    }
  }, [gameStats.totalRounds, words]);

  const resetWord = () => {
    setSelectedText("");
    setFeedback(null);
    setHighlightedText("");
    setHighlightPosition({ start: -1, end: -1 });
  };

  const submitAnswer = () => {
    if (!selectedText) return;

    const isCorrect = selectedText === currentWord.suffix;

    setFeedback({
      isCorrect,
      targetPart: currentWord.suffix,
      selectedText,
    });

    // If answer is wrong, highlight the correct answer instead
    if (!isCorrect) {
      const word = currentWord.word;
      const suffix = currentWord.suffix;
      const correctIndex = word.lastIndexOf(suffix); // Use lastIndexOf for suffix
      setHighlightedText(suffix);
      setHighlightPosition({
        start: correctIndex,
        end: correctIndex + suffix.length,
      });
    }
    // If correct, keep the user's selection highlighted

    // Update game stats only for non-example questions
    if (!currentWord.isExample) {
      const questionEndTime = Date.now();
      const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

      setGameStats((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            question: currentWord.word,
            target: currentWord.suffix,
            result: selectedText,
            isCorrect: isCorrect,
            seconds: secondsForQuestion,
          },
        ],
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      }));
    }

    // Play word-specific audio if available (for example words)
    const audioFile = wordAudioMap[currentWord.word];
    if (audioFile) {
      setCurrentWordAudio(audioFile);
      setIsWordAudioPlaying(true);
      // Small delay to ensure audio ref is updated
      setTimeout(() => {
        playWordAudio().catch((error) => {
          console.error("Error playing word audio:", error);
          setIsWordAudioPlaying(false);
        });
      }, 100);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
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

    const results = {
      studentId: studentId,
      datetime: datetime,
      gameName: "RootSuffixGame",
      questions: gameData.gameStats.rounds,
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

  const handleTextSelection = () => {
    // Prevent selection if feedback has already been given or audio is playing
    if (feedback || isInitialAudioPlaying) return;

    const selection = window.getSelection();
    if (selection.toString() && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      const word = currentWord.word;

      // For now, let's use a simpler approach: find ALL occurrences and highlight the selected one
      // We'll store both the text and which occurrence it is
      const occurrences = [];
      let index = 0;
      while ((index = word.indexOf(selectedText, index)) !== -1) {
        occurrences.push(index);
        index++;
      }

      // For simplicity, let's highlight the last occurrence for suffixes
      // This works well for most cases
      const targetIndex = occurrences[occurrences.length - 1];

      if (targetIndex !== -1) {
        setSelectedText(selectedText);
        setHighlightedText(selectedText);
        setHighlightPosition({
          start: targetIndex,
          end: targetIndex + selectedText.length,
        });
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
        <span
          style={{
            backgroundColor: "#8e44ad",
            color: "white",
            padding: "2px 4px",
            borderRadius: "3px",
          }}
        >
          {text.substring(start, end)}
        </span>
        {text.substring(end)}
      </>
    );
  };

  // Play bravo audio when game completes
  useEffect(() => {
    if (gameCompleted) {
      const audio = new Audio(bravoAudio);
      audio.play().catch((error) => {
        console.error("Error playing bravo audio:", error);
      });
    }
  }, [gameCompleted]);

  if (gameCompleted) {
    return (
      <Container fluid className="game-container">
        <Row className="game-row-centered">
          <Col md={12} lg={10}>
            <QuestionProgressLights
              totalQuestions={gameStats.totalRounds}
              currentQuestion={gameStats.totalRounds}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
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
      <audio ref={titleAudioRef} src={titleAudioSrc} />
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <audio ref={wordAudioRef} src={wordAudioSrc} />
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!currentWord.isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter((w) => !w.isExample).length}
              currentQuestion={words.slice(0, currentWordIndex).filter((w) => !w.isExample).length}
              answeredQuestions={gameStats.rounds.map((r) => r.isCorrect)}
            />
          )}
          {currentWord.isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className={`text-center`} style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">Βρίσκω και χρωματίζω το επίθημα της λέξης</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div
                className="display-4 font-weight-bold mb-2 p-4"
                style={{
                  cursor: feedback || isInitialAudioPlaying ? "default" : "pointer",
                  userSelect: feedback || isInitialAudioPlaying ? "none" : "text",
                  opacity: isInitialAudioPlaying ? 0.6 : 1,
                }}
                onMouseUp={handleTextSelection}
              >
                {highlightedText ? highlightText(currentWord.word, highlightedText, highlightPosition) : currentWord.word}
              </div>

              {feedback && (
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="fs-1" style={{ color: feedback.isCorrect ? "#28a745" : "#dc3545" }}>
                      {feedback.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          {!feedback && (
            <div className="d-flex gap-3 mt-4 mb-4 justify-content-center">
              <Button
                variant={selectedText && !isInitialAudioPlaying ? "primary" : "secondary"}
                size="lg"
                onClick={submitAnswer}
                disabled={!selectedText || feedback || isInitialAudioPlaying}
              >
                Υποβολή
              </Button>
            </div>
          )}

          {/* Next Word Button (only show after feedback) */}
          {feedback && (
            <div className="text-center mt-4">
              <Button variant="primary" size="lg" onClick={nextWord} disabled={isWordAudioPlaying || waitingForPracticeEnd}>
                {currentWordIndex < words.length - 1 ? "Επόμενη Λέξη" : "Ολοκλήρωση"}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Game2;
