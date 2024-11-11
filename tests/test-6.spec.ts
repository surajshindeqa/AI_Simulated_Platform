import { test, expect } from '@playwright/test';
import fs from 'fs';

test('test', async ({ browser }) => {

    test.setTimeout(60000);

    const context = await browser.newContext({
        permissions: ['microphone'], // Grant microphone permission
    });

    const page = await context.newPage();


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
