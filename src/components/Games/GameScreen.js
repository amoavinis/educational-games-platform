import React from "react";
import { useLocation } from "react-router-dom";
import { sendReport } from "../../services/reports";
import { games as allGames } from "../games";
import "../../styles/Game.css";
import WordHighlightGame from "./Game1";
import RootSuffixGame from "./Game2";

const GameScreen = () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const studentId = searchParams.get("studentId");
  const studentName = searchParams.get("studentName");
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  const games = allGames;
  const game = games.find((g) => g.id === gameId);

  const reportFn = async (data) => {
    let payload = {
      studentId: studentId,
      studentName: studentName,
      gameData: data,
    };

    sendReport(payload);
  };

  return (
    <div className="container h-100">
      <div className="game-header">
        <h2>Playing {game.name}</h2>
        <p>Student: {studentName}</p>
      </div>

      <div className="game-body">
        {gameId === 1 && <WordHighlightGame reportFn={reportFn} />}
        {gameId === 2 && <RootSuffixGame reportFn={reportFn} />}
      </div>
    </div>
  );
};

export default GameScreen;
