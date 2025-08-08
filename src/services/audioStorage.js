import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { storage } from "./firebase";

export const uploadAudioRecording = async (audioBlob, metadata) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { studentId } = metadata;

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

    const baseFileName = `${studentId.slice(0, 6)} ${formattedDateTime}.webm`;
    const fileName = `audio-recordings/${baseFileName}`;

    const audioRef = ref(storage, fileName);

    const uploadResult = await uploadBytes(audioRef, audioBlob);

    const downloadURL = await getDownloadURL(uploadResult.ref);

    return {
      downloadURL,
      fileName: baseFileName, // Return just the base filename for downloads
      timestamp: formattedDateTime,
    };
  } catch (error) {
    console.error("Error uploading audio recording:", error);
    throw error;
  }
};

export const downloadAudioFile = async (downloadURL, filename) => {
  if (downloadURL) {
    try {
      const encodedPath = encodeURIComponent(filename);
      const proxyUrl = `https://europe-west1-educational-games-platform.cloudfunctions.net/downloadFile?filePath=${encodedPath}`;

      const response = await fetch(proxyUrl);
      if (!response.ok)
        throw new Error(`Download failed with status ${response.status}`);
      const blob = await response.blob();
      const fileName = filename;
      return { blob, fileName };
    } catch (error) {
      console.error("Error downloading audio file:", error);
      throw error;
    }
  }
};
