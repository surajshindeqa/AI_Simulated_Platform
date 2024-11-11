import { test, expect } from '@playwright/test';

// Extend the Window interface to include custom functions
declare global {
    interface Window {
        startAudioRecording: () => void;
        stopAudioRecording: () => void;
    }
}

test('test', async ({ page })  => {
    //const browser = await chromium.launch();
    //const context = await browser.newContext();
    //const page = await context.newPage();

    // Navigate to the application page where audio is played
    await page.goto('http://127.0.0.1:3000/');
    await page.getByPlaceholder('name@example.com').fill('suraj@audirie.com');
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByTitle('Aged Care').click();
    await page.getByText('Resume').click(); 
    await page.waitForTimeout(6000);

    // Inject audio recording script into the page
    await page.evaluate(() => {
        const audioContext = new (window.AudioContext)();
        let mediaRecorder: MediaRecorder | null = null;
        const audioChunks: Blob[] = [];

        // Function to start recording
        window.startAudioRecording = () => {
            const stream = audioContext.createMediaStreamDestination();
            const source = audioContext.createMediaElementSource(document.querySelector('audio') as HTMLAudioElement); // Adjust selector if needed
            source.connect(stream);
            source.connect(audioContext.destination); // Connect to speakers

            // Set up MediaRecorder to record the stream
            mediaRecorder = new MediaRecorder(stream.stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                // Download the audio file
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = 'recording.wav';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            mediaRecorder.start();
        };

        // Function to stop recording
        window.stopAudioRecording = () => {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
        };
    });

    await page.evaluate(() => {
        window.startAudioRecording();
    });

    // Wait for some time to record (adjust as needed)
    await page.waitForTimeout(5000); // Record for 5 seconds

    // Stop recording
    await page.evaluate(() => {
        window.stopAudioRecording();
    });

    // Close the browser
    //await browser.close();
});
