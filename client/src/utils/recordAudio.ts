export const recordAudio = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstart = () => {
            audioChunks = []; // Reset audio chunks for each new recording
        };

        return {
            start: () => mediaRecorder.start(),
            stop: () =>
                new Promise((resolve, reject) => {
                    mediaRecorder.onstop = async () => {
                        try {
                            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                            const formData = new FormData();
                            formData.append("file", audioBlob);

                            const response = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                            });

                            if (!response.ok) {
                                throw new Error(`Server error: ${response.statusText}`);
                            }

                            const result = await response.json();

                            // Stop all tracks to release the microphone
                            stream.getTracks().forEach((track) => track.stop());

                            resolve(result);
                        } catch (error) {
                            console.error("Upload error:", error);
                            reject("Failed to upload audio.");
                        }
                    };
                    mediaRecorder.stop();
                }),
        };
    } catch (error) {
        console.error("Recording error:", error);
        throw new Error("Microphone access denied or unavailable.");
    }
};
