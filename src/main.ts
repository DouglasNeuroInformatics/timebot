#!/usr/bin/env node

import { Command } from 'commander';
import puppeteer from 'puppeteer-core';

import packageConfig from '../package.json' with { type: 'json' };

async function action(this: Command) {
  const { password, username } = this.opts<{ password: string; username: string }>();

  const browser = await puppeteer.launch({
    devtools: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    slowMo: 100
  });

  const page = await browser.newPage();

  await page.setViewport({ height: 1080, width: 1920 });

  await page.goto('https://portailrh-rech.comtl.rtss.qc.ca/');

  await page.waitForSelector('#kc-form');
  await page.type('#username', username);
  await page.type('#password', password);
  await page.click('#kc-login');

  await new Promise((r) => setTimeout(r, 5000));

  await browser.close();
}

async function main() {
  const program = new Command();

  program.allowExcessArguments(false);
  program.allowUnknownOption(true);

  program.name(packageConfig.name);
  program.version(packageConfig.version);

  program.requiredOption('-p, --password <string>');
  program.requiredOption('-u, --username <string>');

  program.action(action);

  await program.parseAsync(process.argv);
}

await main();
