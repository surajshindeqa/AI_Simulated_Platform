import { test, expect } from '@playwright/test';
import fs from 'fs';

test('test', async ({ browser }) => {

    test.setTimeout(60000);

    const context = await browser.newContext({
        permissions: ['microphone'], // Grant microphone permission
    });

    const page = await context.newPage();

    // Listen for network requests
    await page.on('response', async (response) => {
        const url = response.url();
        // Check if the response is the one that returns the audio URL
        if (response.ok() && url.includes('&type=audio')) { // Adjust the condition to match your API endpoint
            const audioUrl = response.url(); // Capture the audio URL
            console.log('Captured Audio URL:', audioUrl);

            // Inject the audio playback and recording logic
            await page.evaluate((audioUrl) => {
                const audioContext = new (window.AudioContext)();
                const mediaStreamDestination = audioContext.createMediaStreamDestination();
                let mediaRecorder: MediaRecorder | null = null;
                const audioChunks: Blob[] = [];

                // Create an Audio element
                const audioElement = new Audio(audioUrl);
                audioElement.crossOrigin = 'anonymous'; // Allow cross-origin if necessary

                // Create media element source
                const sourceNode = audioContext.createMediaElementSource(audioElement);
                sourceNode.connect(mediaStreamDestination);
                //sourceNode.connect(audioContext.destination); // Connect to speakers

                // Setup MediaRecorder
                mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    // Create download link
                    const a = document.createElement('a');
                    a.href = audioUrl;
                    a.download = 'recording.mp3';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };

                // Play the audio
                audioElement.play();
                
                // Start recording
                mediaRecorder.start();

                // Stop recording after a set time
                setTimeout(() => {
                    mediaRecorder.stop();
                    audioElement.pause(); // Optionally stop playback
                }, 10000); // Adjust the recording duration as needed
            }, audioUrl); // Pass the captured audio URL to the page context
        }
    });

    // Navigate to your application
    await page.goto('https://app.audirie.com/');
    await page.getByPlaceholder('name@example.com').fill('suraj@audirie.com');
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByTitle('Aged Care').click();
    await page.getByRole('button', { name: 'Resume' }).first().click(); 
    await page.waitForTimeout(6000);

    await page.waitForSelector('//a[text()="Next"]');

    await page.waitForTimeout(3000);

    const audioFilePath1 = 'Recording.mp3'; 

    // Read and encode audio file to Base64 to send it to the browser context
    const audioData = fs.readFileSync(audioFilePath1);
    const audioBase64 = audioData.toString('base64');

    // Inject script to simulate microphone input using the audio file
    await page.evaluate(async (audioBase64) => {
        
        // Decode Base64 to ArrayBuffer
        const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0)).buffer;

        // Set up the AudioContext and decode the audio data
        const audioContext = new (window.AudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(audioBuffer);

        // Create a MediaStreamDestination for routing audio
        const mediaStreamDestination = audioContext.createMediaStreamDestination();

        // Create a buffer source and connect it to the destination
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudio;

        source.connect(audioContext.destination);
        source.connect(mediaStreamDestination);
        source.start();

        // Simulate microphone by connecting the MediaStream to the app
        const simulateMicrophone = (stream) => {
            navigator.mediaDevices.getUserMedia = async () => stream;
        };

        simulateMicrophone(mediaStreamDestination.stream);

        console.log("Simulated audio as microphone input.");
    }, audioBase64);

    // Start interacting with the application to use the microphone
    await page.getByText('Input').click();
    await page.waitForTimeout(10000); 

    await page.getByText('Next').click(); // Adjust selector as needed

    await page.waitForTimeout(10000); 
    
});
