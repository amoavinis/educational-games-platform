import { useLocation } from "react-router-dom";
// import { sendReport } from "../../services/reports";
// import { games as allGames } from "../games";
import "../../styles/Game.css";
import WordHighlightGame from "./WordHighlightGame";
import RootSuffixGame from "./RootSuffixGame";
import GreekReadingExercise from "./GreekReadingExercise";
import WordEndingGame from "./WordEndingGame";
import WordSeparationGame from "./WordSeparationGame";
import PrefixMatchingGame from "./PrefixMatchingGame";
import GreekPrefixGame from "./GreekPrefixGame";
import GreekMorphologyGame from "./GreekMorphologyGame";
import PrefixSuffixHighlightGame from "./PrefixSuffixHighlightGame";
import SyllableReadingGame from "./SyllableReadingGame";
import GreekCliticSuffixGame from "./GreekCliticSuffixGame";
import GreekVerbEndingGame from "./GreekVerbEndingGame";
import GreekWordFormationGame from "./GreekWordFormationGame";
import GreekAdjectiveEndingGame from "./GreekAdjectiveEndingGame";
import GreekSuffixMarqueeGame from "./GreekSuffixMarqueeGame";

const GameScreen = () => {
  const location = useLocation();

  // const searchParams = new URLSearchParams(location.search);
  // const studentId = searchParams.get("studentId");
  // const studentName = searchParams.get("studentName");
  const gameId = parseInt(location.pathname.split("/").pop().split("game")[1]);
  // const games = allGames;
  // const game = games.find((g) => g.id === gameId);

  /* const reportFn = async (data) => {
    let payload = {
      studentId: studentId,
      studentName: studentName,
      gameData: data,
    };

    const uploadRecording = async (blob) => {
      const storageRef = ref(storage, `recordings/${Date.now()}.webm`);
      await uploadBytes(storageRef, blob, { contentType: "audio/webm" });
      return getDownloadURL(storageRef);
    };

    sendReport(payload);
  }; */

  return (
    <div className="container h-100">
      {/* <div className="game-header">
        <h2>Playing {game.name}</h2>
        <p>Student: {studentName}</p>
      </div> */}

      <div className="game-body">
        {gameId === 1 && <WordHighlightGame />}
        {gameId === 2 && <RootSuffixGame />}
        {gameId === 3 && <GreekReadingExercise />}
        {gameId === 4 && <WordEndingGame />}
        {gameId === 5 && <WordSeparationGame />}
        {gameId === 6 && <PrefixMatchingGame />}
        {gameId === 7 && <GreekPrefixGame />}
        {gameId === 8 && <GreekMorphologyGame />}
        {gameId === 9 && <PrefixSuffixHighlightGame />}
        {gameId === 10 && <SyllableReadingGame />}
        {gameId === 11 && <GreekCliticSuffixGame />}
        {gameId === 12 && <GreekVerbEndingGame />}
        {gameId === 13 && <GreekWordFormationGame />}
        {gameId === 14 && <GreekAdjectiveEndingGame />}
        {gameId === 15 && <GreekSuffixMarqueeGame />}
      </div>
    </div>
  );
};

export default GameScreen;
