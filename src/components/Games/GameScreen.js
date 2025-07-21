import { useLocation } from "react-router-dom";
import { sendReport } from "../../services/reports";
import { games as allGames } from "../games";
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
        {gameId === 2 && <RootSuffixGame />}
        {gameId === 3 && <GreekReadingExercise reportFn={reportFn} />}
        {gameId === 4 && <WordEndingGame reportFn={reportFn} />}
        {gameId === 5 && <WordSeparationGame reportFn={reportFn} />}
        {gameId === 6 && <PrefixMatchingGame reportFn={reportFn} />}
        {gameId === 7 && <GreekPrefixGame reportFn={reportFn} />}
        {gameId === 8 && <GreekMorphologyGame reportFn={reportFn} />}
        {gameId === 9 && <PrefixSuffixHighlightGame reportFn={reportFn} />}
        {gameId === 10 && <SyllableReadingGame reportFn={reportFn} />}
        {gameId === 11 && 
          <GreekCliticSuffixGame  reportFn={reportFn} />
        }
        {gameId === 12 && <GreekVerbEndingGame reportFn={reportFn} />}
        {gameId === 13 && <GreekWordFormationGame reportFn={reportFn} />}
        {gameId === 14 && <GreekAdjectiveEndingGame reportFn={reportFn} />}
        {gameId === 15 && <GreekSuffixMarqueeGame reportFn={reportFn} />}
      </div>
    </div>
  );
};

export default GameScreen;
