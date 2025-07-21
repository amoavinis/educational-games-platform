import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import "../../styles/Game.css";

const PrefixMatchingGame = ({ reportFn }) => {
  // Sample words and their prefixes
  const words = [
    {
      base: "understand",
      prefixes: ["mis", "re", "un"],
      correctPrefix: "mis",
      word: "misunderstand",
      audioSlow: require("../../assets/sounds/game3/word1-slow.mp3"),
      audioNormal: require("../../assets/sounds/game3/word1.mp3"),
    },
    {
      base: "do",
      prefixes: ["un", "re", "over"],
      correctPrefix: "over",
      word: "overdo",
      audioSlow: require("../../assets/sounds/game3/word1-slow.mp3"),
      audioNormal: require("../../assets/sounds/game3/word1.mp3"),
    },
    {
      base: "happy",
      prefixes: ["un", "dis", "pre"],
      correctPrefix: "un",
      word: "unhappy",
      audioSlow: require("../../assets/sounds/game3/word1-slow.mp3"),
      audioNormal: require("../../assets/sounds/game3/word1.mp3"),
    },
    {
      base: "build",
      prefixes: ["re", "mis", "pre"],
      correctPrefix: "re",
      word: "rebuild",
      audioSlow: require("../../assets/sounds/game3/word1-slow.mp3"),
      audioNormal: require("../../assets/sounds/game3/word1.mp3"),
    },
    {
      base: "approve",
      prefixes: ["dis", "pre", "un"],
      correctPrefix: "dis",
      word: "disapprove",
      audioSlow: require("../../assets/sounds/game3/word1-slow.mp3"),
      audioNormal: require("../../assets/sounds/game3/word1.mp3"),
    },
  ];

  const [gameState, setGameState] = useState("playing");
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [gameData, setGameData] = useState({
    rounds: [],
    totalCorrect: 0,
    totalRounds: words.length,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [rounds, setRounds] = useState(0);

  // Current word data
  const currentWordData = words[currentRound % words.length];

  const playAudio = useCallback(
    (slow = false) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audioFile = slow
        ? currentWordData.audioSlow
        : currentWordData.audioNormal;
      audioRef.current = new Audio(audioFile);

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
        })
        .catch((error) => {
          setIsPlaying(false);
        });
    },
    [currentWordData.audioNormal, currentWordData.audioSlow]
  );

  // Play audio when round changes
  useEffect(() => {
    if (rounds < words.length) {
      playAudio(true);
    } else if (rounds < words.length * 2) {
      playAudio(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentRound, playAudio, rounds, words.length]);

  // Handle prefix selection
  const handlePrefixSelect = (prefix) => {
    setSelectedPrefix(prefix);
  };

  // Handle submission
  const handleSubmit = () => {
    if (!selectedPrefix) return;

    const isCorrect = selectedPrefix === currentWordData.correctPrefix;

    setGameData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          word: currentWordData.word,
          base: currentWordData.base,
          selectedPrefix: selectedPrefix,
          correctPrefix: currentWordData.correctPrefix,
          correct: isCorrect,
        },
      ],
      totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
    }));

    setRounds(rounds + 1);

    // Move to next word or end game
    if (currentRound < words.length * 2 - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedPrefix(null);
    } else {
      setGameState("completed");
      reportFn({
        ...gameData,
        totalCorrect: isCorrect
          ? gameData.totalCorrect + 1
          : gameData.totalCorrect,
      });
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState("playing");
    setCurrentRound(0);
    setSelectedPrefix(null);
    setGameData({
      rounds: [],
      totalCorrect: 0,
      totalRounds: words.length,
    });
    setRounds(0);
  };

  // Render game screen
  if (gameState !== "completed") {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center full-height">
        <h2 className="mb-4">Complete the Word</h2>

        <ProgressBar
          now={(currentRound / (words.length * 2)) * 100}
          label={`${currentRound}/${words.length * 2}`}
          className="w-100 mb-4"
        />

        <div className="d-flex align-items-center mb-4">
          <div className="display-4 me-3">_____{currentWordData.base}</div>
          <Button
            variant="outline-primary"
            onClick={() => playAudio(rounds < words.length)}
            disabled={isPlaying}
          >
            {isPlaying ? "Playing..." : "Play Sound"}
          </Button>
        </div>

        <Row className="mb-4 w-100">
          {currentWordData.prefixes.map((prefix, index) => (
            <Col key={index} md={4}>
              <Button
                className="w-100"
                variant={
                  selectedPrefix === prefix
                    ? "primary"
                    : prefix === currentWordData.correctPrefix
                    ? "outline-success"
                    : "outline-secondary"
                }
                onClick={() => handlePrefixSelect(prefix)}
              >
                {prefix}
              </Button>
            </Col>
          ))}
        </Row>

        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!selectedPrefix}
          className="mt-3"
        >
          Submit
        </Button>
      </Container>
    );
  } else {
    // Render results screen
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center">
        <Card className="w-100">
          <Card.Header as="h3">Game Results</Card.Header>
          <Card.Body>
            <p className="h4 text-center mb-4">
              Score: {gameData.totalCorrect} / {gameData.totalRounds}
            </p>
            <div className="mb-4">
              <h5>Word Results:</h5>
              <ul className="list-group">
                {gameData.rounds.map((round, index) => (
                  <li key={index} className="list-group-item">
                    <div>
                      Word: <strong>{round.word}</strong>
                    </div>
                    <div>
                      You selected:{" "}
                      <strong
                        className={
                          round.correct ? "text-success" : "text-danger"
                        }
                      >
                        {round.selectedPrefix}
                        {round.base}
                      </strong>
                    </div>
                    {!round.correct && (
                      <div>
                        Correct answer:{" "}
                        <strong className="text-success">
                          {round.correctPrefix}
                          {round.base}
                        </strong>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

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

export default PrefixMatchingGame;