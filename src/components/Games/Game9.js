// Game 9
import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import QuestionProgressLights from "../QuestionProgressLights";
import { addReport } from "../../services/reports";
import { game9Words } from "../Data/Game9Data";
import useAudio from "../../hooks/useAudio";
import instructionsPrefixAudio from "../../assets/sounds/09/instructions-prefix.mp3";
import instructionsSuffixAudio from "../../assets/sounds/09/instructions-suffix.mp3";
import practiceEnd from "../../assets/sounds/general/end-of-practice.mp3";

import exampleKataprasinosAudio from "../../assets/sounds/09/example-καταπράσινος-κατα.mp3";
import exampleEpidenoAudio from "../../assets/sounds/09/example-επιδένω-επι.mp3";
import exampleNomikosAudio from "../../assets/sounds/09/example-νομικός-ικος.mp3";
import ainoAudio from "../../assets/sounds/09/αινω.mp3";
import antiAudio from "../../assets/sounds/09/αντι.mp3";
import apoAudio from "../../assets/sounds/09/απο.mp3";
import dysAudio from "../../assets/sounds/09/δυσ.mp3";
import eiaAudio from "../../assets/sounds/09/εια.mp3";
import isiAudio from "../../assets/sounds/09/ηση.mp3";
import izoAudio from "../../assets/sounds/09/ιζω.mp3";
import ikosAudio from "../../assets/sounds/09/ικος.mp3";
import ismosAudio from "../../assets/sounds/09/ισμος.mp3";
import yperAudio from "../../assets/sounds/09/υπερ.mp3";
import ypoAudio from "../../assets/sounds/09/υπο.mp3";
import bravoAudio from "../../assets/sounds/general/bravo.mp3";

const Game9 = ({ gameId, schoolId, studentId, classId }) => {
  const navigate = useNavigate();
  const words = useMemo(() => {
    const examples = game9Words.filter((w) => w.isExample);
    const nonExamples = game9Words.filter((w) => !w.isExample);

    // Shuffle non-examples using Fisher-Yates algorithm
    const shuffled = [...nonExamples];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return [...examples, ...shuffled];
  }, []);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [highlightPosition, setHighlightPosition] = useState({ start: -1, end: -1 });
  const [feedback, setFeedback] = useState(null);
  const [isInstructionsAudioPlaying, setIsInstructionsAudioPlaying] = useState(true);
  const [isWordAudioPlaying, setIsWordAudioPlaying] = useState(false);
  const [currentWordAudio, setCurrentWordAudio] = useState(null);
  const [currentInstructionsAudio, setCurrentInstructionsAudio] = useState(null);
  const [waitingForPracticeEnd, setWaitingForPracticeEnd] = useState(false);

  // Map prefixes and suffixes to their audio files
  const partAudioMap = useMemo(
    () => ({
      // Example words (whole word audio)
      καταπρασινος: exampleKataprasinosAudio,
      επιδενω: exampleEpidenoAudio,
      νομικος: exampleNomikosAudio,
      // Prefixes
      αντι: antiAudio,
      απο: apoAudio,
      δυσ: dysAudio,
      υπερ: yperAudio,
      υπο: ypoAudio,
      // Suffixes
      αινω: ainoAudio,
      εια: eiaAudio,
      ηση: isiAudio,
      ιζω: izoAudio,
      ικος: ikosAudio,
      ισμος: ismosAudio,
      ος: ikosAudio, // Map ός to ικος audio
    }),
    []
  );

  // Instructions audio based on task type
  const instructionsAudioRef = useAudio(currentInstructionsAudio, {
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

  // Current word data
  const currentWord = words[currentQuestion];
  const targetPart = currentWord.task === "prefix" ? currentWord.prefix : currentWord.suffix;

  // Play instructions audio when question changes (only for example questions)
  useEffect(() => {
    if (!gameCompleted && currentWord.isExample) {
      const taskAudio = currentWord.task === "prefix" ? instructionsPrefixAudio : instructionsSuffixAudio;
      setCurrentInstructionsAudio(taskAudio);
      setIsInstructionsAudioPlaying(true);

      const timer = setTimeout(() => {
        if (instructionsAudioRef.audioRef.current) {
          instructionsAudioRef.audioRef.current.play().catch((error) => {
            console.error("Error playing instructions audio:", error);
            setIsInstructionsAudioPlaying(false);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // For non-example questions, set instructions audio as not playing
      setIsInstructionsAudioPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameCompleted, currentWord.task, currentWord.isExample]);

  // Listen for instructions audio ended
  useEffect(() => {
    const audio = instructionsAudioRef.audioRef.current;
    const handleEnded = () => {
      setIsInstructionsAudioPlaying(false);
    };

    if (audio) {
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [instructionsAudioRef]);

  // Listen for word audio ended
  useEffect(() => {
    const audio = wordAudioRef.current;
    const handleEnded = () => {
      setIsWordAudioPlaying(false);
      const currentW = words[currentQuestion];
      if (currentW.isExample && currentQuestion < words.length - 1 && !words[currentQuestion + 1].isExample) {
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
  }, [wordAudioRef, currentQuestion, words, practiceEndAudioRef]);

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

  // Handle answer selection
  const handleAnswerSelect = () => {
    if (!selectedText || selectedAnswer !== null) return;

    const isCorrect = selectedText === targetPart;
    setSelectedAnswer(selectedText);

    setFeedback({
      isCorrect,
      targetPart: targetPart,
      selectedText,
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
    const secondsForQuestion = questionStartTime ? (questionEndTime - questionStartTime) / 1000 : 0;

    // Track the result only for non-example questions
    if (!currentWord.isExample) {
      const taskType = currentWord.task === "prefix" ? "πρόθεμα" : "επίθημα";
      setGameResults((prev) => [
        ...prev,
        {
          question: `${currentWord.word} (${taskType})`,
          result: selectedText,
          target: targetPart,
          isCorrect: isCorrect,
          seconds: secondsForQuestion,
        },
      ]);
    }

    // Play audio for the target part (prefix/suffix) or whole word for examples
    // For example words, use the whole word; for others, use the target part
    const audioKey = currentWord.isExample
      ? currentWord.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : targetPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const audioFile = partAudioMap[audioKey];
    if (audioFile) {
      setCurrentWordAudio(audioFile);
      setIsWordAudioPlaying(true);
      setTimeout(() => {
        playWordAudio().catch((error) => {
          console.error("Error playing word audio:", error);
          setIsWordAudioPlaying(false);
        });
      }, 100);
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
    setSelectedText("");
    setFeedback(null);
    setHighlightedText("");
    setHighlightPosition({ start: -1, end: -1 });
  };

  // Submit game results function
  const submitGameResults = async () => {
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
      gameName: "PrefixSuffixHighlightGame",
      questions: gameResults,
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

  // Text selection handler
  const handleTextSelection = () => {
    // Prevent selection if feedback has already been given or instructions audio is playing
    if (feedback || isInstructionsAudioPlaying) return;

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
    const backgroundColor = currentWord.task === "suffix" ? "#6f42c1" : "#28a745";

    return (
      <>
        {text.substring(0, start)}
        <span style={{ backgroundColor: backgroundColor, color: "white", padding: "2px 4px", borderRadius: "3px" }}>{text.substring(start, end)}</span>
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
    return currentWord.task === "prefix" ? "Βρίσκω και χρωματίζω το πρόθημα της λέξης" : "Βρίσκω και χρωματίζω το επίθημα της λέξης";
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
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <QuestionProgressLights
          totalQuestions={words.filter((q) => !q.isExample).length}
          currentQuestion={words.filter((q) => !q.isExample).length}
          answeredQuestions={gameResults.map((r) => r.isCorrect)}
        />
        <Card className="w-100" style={{ maxWidth: "600px" }}>
          <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
            <h3 className="mb-0">Μπράβο! Τελείωσες την άσκηση!</h3>
          </Card.Header>
          <Card.Body className="text-center">
            <Button variant="primary" size="lg" onClick={() => navigate("/")} className="mt-4">
              Τέλος Άσκησης
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="game-container">
      <audio ref={instructionsAudioRef.audioRef} src={instructionsAudioRef.audioSrc} />
      <audio ref={practiceEndAudioRef} src={practiceEndAudioSrc} />
      <audio ref={wordAudioRef} src={wordAudioSrc} />
      <Row className="game-row-centered">
        <Col md={12} lg={10}>
          {!words[currentQuestion].isExample && (
            <QuestionProgressLights
              totalQuestions={words.filter((q) => !q.isExample).length}
              currentQuestion={words.slice(0, currentQuestion).filter((q) => !q.isExample).length}
              answeredQuestions={gameResults.map((r) => r.isCorrect)}
            />
          )}
          {words[currentQuestion].isExample && (
            <div className="d-flex justify-content-center">
              <span className="example-badge">📚 Παράδειγμα</span>
            </div>
          )}
          <Card className="main-card">
            <Card.Header className="text-center" style={{ backgroundColor: "#2F4F4F", color: "white" }}>
              <h4 className="mb-0 game-title-header">{getTaskTitle()}</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-4"></div>

              <div className="p-4 bg-light rounded mb-2">
                <div
                  className="display-4 font-weight-bold mb-3"
                  style={{
                    cursor: feedback || isInstructionsAudioPlaying ? "default" : "pointer",
                    userSelect: feedback || isInstructionsAudioPlaying ? "none" : "text",
                    opacity: isInstructionsAudioPlaying ? 0.6 : 1,
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
              </div>

              {/* Action Buttons */}
              {!feedback && (
                <div className="d-flex gap-3 mt-4 mb-4 justify-content-center">
                  <Button
                    variant={selectedText && !isInstructionsAudioPlaying ? "primary" : "secondary"}
                    size="lg"
                    onClick={handleAnswerSelect}
                    disabled={!selectedText || selectedAnswer !== null || isInstructionsAudioPlaying || waitingForPracticeEnd}
                  >
                    Υποβολή
                  </Button>
                </div>
              )}

              {/* Next Question Button (only show after feedback) */}
              {feedback && (
                <div className="text-center mt-4">
                  <Button variant="primary" size="lg" onClick={nextQuestion} disabled={isWordAudioPlaying || waitingForPracticeEnd}>
                    {currentQuestion < words.length - 1 ? "Επόμενη Λέξη" : "Ολοκλήρωση"}
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

export default Game9;
