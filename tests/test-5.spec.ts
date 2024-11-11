import { test,chromium } from '@playwright/test';

test('test web microphone', async () => {

    test.setTimeout(250000);


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

  // Create a new page in the context
  const page = await context.newPage();

  // Navigate to the microphone test site
  await page.goto('https://mictests.com/');

  // Click the button to test the microphone
  await page.getByRole('button', { name: 'Test my mic' }).click();

  // Wait for a specific duration (40 seconds as per the original code)
  await page.waitForTimeout(40000);

  // Click the button to stop the microphone
  await page.getByRole('button', { name: 'Stop microphone' }).click();

  // Optionally pause the execution for debugging
  await page.pause();

  // Close the context, which also closes all pages within it
  await context.close();
});
