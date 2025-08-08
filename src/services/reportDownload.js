import JSZip from "jszip";
import * as XLSX from "xlsx";
import { downloadAudioFile } from "./audioStorage";

export const downloadReportsWithAudio = async (
  reportData,
  schools,
  games,
  selectedSchool,
  selectedGame
) => {
  try {
    const selectedSchoolName =
      schools.find((s) => s.id === selectedSchool)?.name || "Άγνωστο Σχολείο";
    const selectedGameName =
      games.find((g) => g.id === parseInt(selectedGame))?.name ||
      "Άγνωστο Παιχνίδι";

    const zip = new JSZip();

    // Create the Excel report
    const wb = XLSX.utils.book_new();
    const excelData = [];

    excelData.push([`Σχολείο: ${selectedSchoolName}`]);
    excelData.push([`Παιχνίδι: ${selectedGameName} (ID: ${selectedGame})`]);
    excelData.push([]);

    let maxQuestions = 0;
    reportData.forEach((report) => {
      if (report.parsedResults?.questions)
        maxQuestions = Math.max(
          maxQuestions,
          report.parsedResults.questions.length
        );
    });

    // Headers
    const headers = [
      "Μαθητής",
      "Τάξη",
      "Ημερομηνία/Ώρα",
      "Φύλο",
      "Ημερομηνία Γέννησης",
      "Διάγνωση",
    ];
    for (let i = 1; i <= maxQuestions; i++) {
      headers.push(
        `Ερώτηση ${i}`,
        `Απάντηση ${i}`,
        `Σωστή ${i}`,
        `Χρόνος ${i}`,
        `Προσπάθειες ${i}`
      );
    }
    excelData.push(headers);

    // Audio files folder
    const audioFolder = zip.folder("audio_recordings");
    const audioPromises = [];

    // Data rows
    reportData.forEach((report) => {
      const row = [
        report.studentName,
        report.className,
        report.parsedResults?.datetime || "N/A",
        report.studentGender || "-",
        report.studentDateOfBirth || "-",
        report.studentDiagnosis === true
          ? "Ναι"
          : report.studentDiagnosis === false
          ? "Όχι"
          : "-",
      ];

      // Add question data
      for (let i = 0; i < maxQuestions; i++) {
        const question = report.parsedResults?.questions?.[i];
        if (question) {
          row.push(
            question.question || "N/A",
            question.selectedAnswer || question.answer || "N/A",
            question.correct !== undefined
              ? question.correct
                ? "Ναι"
                : "Όχι"
              : "N/A",
            question.responseTime ? `${question.responseTime}ms` : "N/A",
            question.attempts || "N/A"
          );
        } else {
          row.push("N/A", "N/A", "N/A", "N/A", "N/A");
        }
      }
      excelData.push(row);

      // Download audio file if available
      if (report.parsedResults?.audioDownloadURL) {
        const convertDateTime = (datetime) => {
          if (!datetime) return "unknown";
          const date = new Date(datetime);
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        };

        const audioPromise = downloadAudioFile(
          report.parsedResults.audioDownloadURL,
          `${report.studentId.slice(0, 6)} ${convertDateTime(
            report.parsedResults.datetime
          )}.webm`
        )
          .then(({ blob, fileName }) => {
            audioFolder.file(fileName, blob);
          })
          .catch((error) => {
            console.error(
              `Failed to download audio for ${report.studentName}:`,
              error
            );
          });

        audioPromises.push(audioPromise);
      }
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Merge headers for question groups
    for (let i = 2; i < 2 + maxQuestions * 5; i += 5) {
      ws["!merges"] = ws["!merges"] || [];
      ws["!merges"].push({ s: { r: 2, c: i }, e: { r: 2, c: i + 4 } });
    }

    XLSX.utils.book_append_sheet(wb, ws, "Αναφορά");

    // Convert Excel to buffer and add to zip
    const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split("T")[0];
    const excelFilename = `Αναφορα_${selectedGameName.replace(
      /\s+/g,
      "_"
    )}_${dateStr}.xlsx`;
    zip.file(excelFilename, excelBuffer);

    // Wait for all audio downloads to complete
    await Promise.allSettled(audioPromises);

    // Generate and download the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFilename = `Reports_with_Audio_${selectedGameName.replace(
      /\s+/g,
      "_"
    )}_${dateStr}.zip`;

    // Create download link
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename: zipFilename };
  } catch (error) {
    console.error("Error creating reports with audio:", error);
    throw error;
  }
};
