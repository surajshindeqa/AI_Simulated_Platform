import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import * as path from 'path';
import axios from 'axios';

async function getTextSimilarity(sentence1, sentence2) {
    const endpoint = "https://secondanalytics.cognitiveservices.azure.com/";
    const key = "EZIhZn2XQTIFeMs0Nn6BFwABJZYYfDFJGa87ycLjhOi9LjoRI3KtJQQJ99AKACYeBjFXJ3w3AAAaACOGEEoC"; // Replace with your API key
    
    const response = await axios.post(endpoint, {
        documents: [
            { id: "1", text: sentence1 },
            { id: "2", text: sentence2 },
        ]
    }, {
        headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/json",
        }
    });

    console.log('Similarity:', response.data);
}

// Function to play audio
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

    const audioFilePath = path.resolve(__dirname, 'D:/Projects/First/record_out.wav');

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
            '--use-file-for-fake-audio-capture=D:/Projects/First/record_out.wav'
        ]
    });

    const context = await browser.newContext({
        permissions: ['microphone'], // Grant microphone permission
        
    });

    const page = await context.newPage();

    await page.goto('https://app.audirie.com/');
    await page.getByPlaceholder('name@example.com').fill('suraj@audirie.com');
    await page.getByPlaceholder('Password').fill('Test@1234');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByTitle('Aged Care').click();
    await page.getByRole('button', { name: 'Resume' }).first().click(); 
    await page.waitForTimeout(6000);

    await page.waitForSelector('//a[text()="Next"]');

    await page.waitForTimeout(3000);

    playAudio(audioFilePath);

    await page.waitForTimeout(10000); 

    await page.getByText('Next').click();

    await page.waitForTimeout(30000);

    

    const sentence1 = 'Im just here for a quick check on your medications, Dorothy. Is that alright with you?';
    const sentence2 = await page.locator('xpath=//div[@id="questions"]/div[2]/p').textContent();

    const semanticAnalysis = await getTextSimilarity(sentence1, sentence2);

     console.log('Semantic Analysis Result:', semanticAnalysis);

     await page.waitForTimeout(20000);

});
