import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Card, Container, ProgressBar } from "react-bootstrap";
import "../../styles/Game.css";

const RootSuffixGame = ({ reportFn }) => {
  // Sample roots and suffixes
  const roots = ["act" /* "form", "spect", "port", "ject" */];
  const suffixes = {
    act: ["ing", "ion", "or"],
    /* form: ["al", "ation", "less"],
    spect: ["acle", "ator", "rum"],
    port: ["able", "age", "al"],
    ject: ["ion", "ile", "or"], */
  };

  // Generate word list
  const generateWordList = () => {
    return roots.flatMap((root) =>
      suffixes[root].map((suffix) => ({
        word: root + suffix,
        root: root,
        suffix: suffix,
      }))
    );
  };

  const wordList = generateWordList();
  const [gameState, setGameState] = useState("firstPass"); // "firstPass", "timedPass", "completed"
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(5);
  const [gameData, setGameData] = useState({
    rounds: [],
    totalCorrect: 0,
    totalRounds: wordList.length * 2,
    firstPass: [],
    timedPass: [],
  });

  // Current word
  const currentWord = wordList[currentRound % wordList.length]?.word || "";
  const currentRoot = wordList[currentRound % wordList.length]?.root || "";
  const currentSuffix = wordList[currentRound % wordList.length]?.suffix || "";

  // Audio recording state
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // Timer logic - just tracks time without auto-advancing
  useEffect(() => {
    if (gameState === "timedPass" && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [gameState, timer, currentRound]); // Reset when word changes

  // Reset timer when word changes
  useEffect(() => {
    if (gameState === "timedPass") {
      setTimer(5);
    }
  }, [currentRound, gameState]);

  // Modified startRecording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.current.start(200);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  // New stopRecording function
  const stopRecording = () => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Handle evaluation
  const handleEvaluation = useCallback(
    (correct) => {
      // Update game data
      const roundType = gameState === "firstPass" ? "firstPass" : "timedPass";

      setGameData((prev) => ({
        ...prev,
        rounds: [
          ...prev.rounds,
          {
            word: currentWord,
            root: currentRoot,
            suffix: currentSuffix,
            correct: correct,
            round: currentRound + 1,
            pass: roundType,
            timeLeft: gameState === "timedPass" ? timer : null,
          },
        ],
        totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
        [roundType]: [
          ...prev[roundType],
          {
            word: currentWord,
            correct: correct,
            timeLeft: gameState === "timedPass" ? timer : null,
          },
        ],
      }));

      // Move to next word and reset timer if in timed pass
      if (currentRound < wordList.length - 1) {
        setCurrentRound(currentRound + 1);
        if (gameState === "timedPass") {
          setTimer(5); // Reset timer for next word
        }
      } else {
        if (gameState === "firstPass") {
          setGameState("timedPass");
          setCurrentRound(0);
          setTimer(5);
        } else {
          stopRecording();
          setGameState("completed");
          stopRecording();
          reportFn({
            ...gameData,
            audioRecording: audioUrl,
          });
        }
      }
    },
    [
      audioUrl,
      currentRoot,
      currentRound,
      currentSuffix,
      currentWord,
      gameData,
      gameState,
      reportFn,
      timer,
      wordList.length,
    ]
  );

  // Reset game
  const resetGame = () => {
    setGameState("firstPass");
    setCurrentRound(0);
    setTimer(5);
    setGameData({
      rounds: [],
      totalCorrect: 0,
      totalRounds: wordList.length * 2,
      firstPass: [],
      timedPass: [],
    });
    setAudioUrl("");
    setIsRecording(false);
  };

  // Audio player component
  const AudioPlayer = () => {
    useEffect(() => {
      return () => {
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl); // Clean up memory
        }
      };
    }, []);

    return (
      <div className="mt-3">
        <h5>Your Recording:</h5>
        <audio
          ref={audioRef}
          controls
          src={audioUrl}
          onLoadedMetadata={() => {
            // Force duration update when metadata loads
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
            }
          }}
          onEnded={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
            }
          }}
          className="w-100"
        />
      </div>
    );
  };

  // Render game screen
  if (gameState !== "completed") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">
          {gameState === "firstPass"
            ? "Read the word aloud"
            : "Read the word before time runs out"}
        </h2>

        <ProgressBar
          now={
            ((currentRound +
              (gameState === "timedPass" ? wordList.length : 0)) /
              (wordList.length * 2)) *
            100
          }
          label={`${
            currentRound + (gameState === "timedPass" ? wordList.length : 0)
          }/${wordList.length * 2}`}
          className="w-100 mb-4"
        />

        {gameState === "timedPass" ? (
          <div className="mb-3">
            <h3 className={timer > 0 ? "text-primary" : "text-danger"}>
              {timer}s
            </h3>
          </div>
        ) : (
          <div style={{ height: 41.6, marginBottom: "1rem" }}></div>
        )}

        <div className="mb-4" style={{ fontSize: "2rem" }}>
          {currentWord}
        </div>

        <div className="mb-4">
          <p>
            Root: <strong>{currentRoot}</strong>
          </p>
          <p>
            Suffix: <strong>{currentSuffix}</strong>
          </p>
        </div>

        <div className="d-flex gap-3">
          <Button variant="success" onClick={() => handleEvaluation(true)}>
            Correct
          </Button>
          <Button variant="danger" onClick={() => handleEvaluation(false)}>
            Incorrect
          </Button>
        </div>

        <div className="d-flex mt-5 gap-3" style={{ minHeight: 60 }}>
          {!isRecording && (
            <Button variant="primary" onClick={startRecording} className="mb-3">
              Start Recording
            </Button>
          )}
          {isRecording && (
            <div className="mb-3 text-danger d-flex flex-row align-items-center">
              <strong>Recording...</strong>
            </div>
          )}
          {isRecording && (
            <Button variant="warning" onClick={stopRecording} className="mb-3">
              Stop Recording
            </Button>
          )}
        </div>
      </Container>
    );
  } else {
    // Render results screen
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <Card className="w-100">
          <Card.Header as="h3">Game Results</Card.Header>
          <Card.Body>
            <p className="h4 text-center mb-4">
              Score: {gameData.totalCorrect} / {gameData.totalRounds}
            </p>
            <div className="mb-4">
              <h5>First Pass:</h5>
              <ul className="list-group">
                {gameData.firstPass.map((round, index) => (
                  <li key={`first-${index}`} className="list-group-item">
                    Word: <strong>{round.word}</strong> |{" "}
                    {round.correct ? (
                      <span className="text-success">Correct</span>
                    ) : (
                      <span className="text-danger">Incorrect</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <h5>Timed Pass:</h5>
              <ul className="list-group">
                {gameData.timedPass.map((round, index) => (
                  <li key={`timed-${index}`} className="list-group-item">
                    Word: <strong>{round.word}</strong> |{" "}
                    {round.correct ? (
                      <span className="text-success">
                        Correct ({round.timeLeft}s left)
                      </span>
                    ) : (
                      <span className="text-danger">
                        Incorrect ({round.timeLeft || 0}s left)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {audioUrl && <AudioPlayer />}

            <div className="d-flex justify-content-between">
              <Button variant="secondary" href="/">
                Back to Home
              </Button>
              <Button variant="primary" onClick={resetGame}>
                Play Again
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
};

export default RootSuffixGame;
