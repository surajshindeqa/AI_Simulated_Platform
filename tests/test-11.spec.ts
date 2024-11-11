import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import * as path from 'path';
import axios from 'axios';

const fetch = require('node-fetch');

async function getSemanticSimilarity(sentence1, sentence2) {
    const apiKey = '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';  // Replace with your Hugging Face API key
    const model = 'sentence-transformers/paraphrase-MiniLM-L6-v2';
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ inputs: { source_sentence: sentence1, target_sentence: sentence2 } })
    });
    
    const result = await response.json();
    const similarity = result.score;
    
    if (similarity > 0.8) return "similar";
    else if (similarity > 0.5) return "mostly similar";
    return "not similar";
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

    console.log(sentence1)
    console.log(sentence2)

    getSemanticSimilarity(sentence1, sentence2)
    .then(category => console.log("Similarity category:", category))
    .catch(console.error);

     //console.log('Semantic Analysis Result:', semanticAnalysis);

     await page.waitForTimeout(5000);

});
