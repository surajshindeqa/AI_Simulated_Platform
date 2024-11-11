import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import * as path from 'path';


async function createContextWithAudioFile(browser, audioFilePath) {

    const context = await browser.newContext({
        permissions: ['microphone'], // Grant permission for microphone
    });
    const page = await context.newPage();

    //await page.goto('https://your-application-url.com'); // Replace with your application URL

    // Set up the audio file as fake microphone input
    await page.evaluate((filePath) => {
        // Creating a script to set up the fake microphone input
        const audioContext = new (window.AudioContext)();
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        const audioElement = document.createElement('audio');

        audioElement.src = filePath; // The path to the audio file
        audioElement.loop = true; // Loop the audio
        audioElement.play(); // Play the audio

        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(mediaStreamDestination);
        audioContext.resume(); // Ensure the audio context is resumed

        return mediaStreamDestination.stream; // Return the audio stream
    }, audioFilePath);

    return { context, page };
}

// Utility function to play audio
function playAudio(filePath: string) {
  const command = `ffplay -nodisp -autoexit "${filePath}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error playing audio: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`ffplay stderr: ${stderr}`);
    }
    console.log(`Audio played: ${stdout}`);
  });
}

// Define the test case
test('simulate microphone input after condition is met', async () => {

    test.setTimeout(350000);

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--use-fake-device-for-media-stream',
        ],
    });

    const audioFiles = [
        path.resolve(__dirname, 'D:/Projects/First/recordone.wav'), 
        path.resolve(__dirname, 'D:/Projects/First/recordtwo.wav'),
    ];

    // Open the browser and process the first audio file
    let { context, page } = await createContextWithAudioFile(browser, audioFiles[0]);

    //const page = await context.newPage();

    await page.goto('https://app.audirie.com/');
    await page.getByPlaceholder('name@example.com').fill('suraj@audirie.com');
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Admin - New Bundle Type').click();
    await page.getByTitle('Admin Mega Bundle').click();
    await page.getByRole('button', { name: 'Resume' }).first().click(); 
    await page.waitForTimeout(6000);

    await page.waitForSelector('//a[text()="Next"]');

    await page.waitForTimeout(3000);

    playAudio(audioFiles[0]);

    await page.waitForTimeout(10000);

    await page.getByText('Next').click();

    await page.waitForSelector('//a[text()="Next"]');

    ({ context, page } = await createContextWithAudioFile(browser, audioFiles[1]));

    playAudio(audioFiles[1]);

    await page.waitForTimeout(10000);  // Adjust this delay as needed

    await page.getByText('Next').click();

    await page.waitForTimeout(40000);

});
