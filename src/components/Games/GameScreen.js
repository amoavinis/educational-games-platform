import React from "react";
import { useLocation } from "react-router-dom";
import { sendReport } from "../../services/reports";
import { games as allGames } from "../games";
import "../../styles/Game.css";
import WordHighlightGame from "./Game1";
import RootSuffixGame from "./Game2";
import WordEndingGame from "./Game3";
import WordSeparationGame from "./Game4";
import PrefixMatchingGame from "./Game5";
import GreekPrefixGame from "./Game6";
import GreekMorphologyGame from "./Game7";
import PrefixSuffixHighlightGame from "./Game8";
import SyllableReadingGame from "./Game9";
import GreekCliticSuffixGame from "./Game10And11";
import GreekVerbEndingGame from "./Game12";
import GreekWordFormationGame from "./Game13";
import GreekAdjectiveEndingGame from "./Game14";
import GreekSuffixMarqueeGame from "./Game15";

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

    /* const uploadRecording = async (blob) => {
      const storageRef = ref(storage, `recordings/${Date.now()}.webm`);
      await uploadBytes(storageRef, blob, { contentType: "audio/webm" });
      return getDownloadURL(storageRef);
    }; */

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
        {gameId === 3 && <WordEndingGame reportFn={reportFn} />}
        {gameId === 4 && <WordSeparationGame reportFn={reportFn} />}
        {gameId === 5 && <PrefixMatchingGame reportFn={reportFn} />}
        {gameId === 6 && <GreekPrefixGame reportFn={reportFn} />}
        {gameId === 7 && <GreekMorphologyGame reportFn={reportFn} />}
        {gameId === 8 && <PrefixSuffixHighlightGame reportFn={reportFn} />}
        {gameId === 9 && <SyllableReadingGame reportFn={reportFn} />}
        {gameId === 10 && (
          <GreekCliticSuffixGame level={10} reportFn={reportFn} />
        )}
        {gameId === 11 && (
          <GreekCliticSuffixGame level={11} reportFn={reportFn} />
        )}
        {gameId === 12 && <GreekVerbEndingGame reportFn={reportFn} />}
        {gameId === 13 && <GreekWordFormationGame reportFn={reportFn} />}
        {gameId === 14 && <GreekAdjectiveEndingGame reportFn={reportFn} />}
        {gameId === 15 && <GreekSuffixMarqueeGame reportFn={reportFn} />}
      </div>
    </div>
  );
};

export default GameScreen;
