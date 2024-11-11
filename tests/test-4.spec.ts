import { test, expect,chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('test', async () => {

    test.setTimeout(150000);

    const audioFilePath = path.resolve(__dirname, 'D:/Projects/First/output.wav');

    const browser = await chromium.launch({
        headless: false,
        args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream',
            '--use-file-for-fake-audio-capture=D:/Projects/First/output.wav'
        ]
    });

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

    await page.evaluate(() => {
        const audio = new Audio('D:/Projects/First/output.wav'); 
        audio.play(); 
    });

    //await page.getByText('Input').click();
    await page.waitForTimeout(10000); 

    //await playAudio(base64Audio);

    await page.waitForTimeout(10000);

    await page.getByText('Next').click(); // Adjust selector as needed

    await page.waitForTimeout(40000); 
    
});
