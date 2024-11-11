import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import * as path from 'path';

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

    await page.waitForTimeout(40000);

});
