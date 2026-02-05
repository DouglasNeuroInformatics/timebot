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
    // dumpio: true,
    timeout: 10_000
    // slowMo: 50
  });

  const page = await browser.newPage();

  await page.setViewport({ height: 1024, width: 1080 });

  await page.goto('https://portailrh-rech.comtl.rtss.qc.ca/');

  await page.waitForSelector('#kc-form');
  await page.type('#username', username);
  await page.type('#password', password);
  await page.click('#kc-login');

  const menuFrame = await page.waitForFrame((frame) => frame.name() === 'Menu');
  await menuFrame.waitForSelector('a');

  (await menuFrame.waitForSelector('::-p-text(Relevé de présence)', { visible: true }).then((el) => el!.click()))!;

  (await menuFrame.waitForSelector("::-p-text(Relevé de l'employé)").then((el) => el!.click()))!;

  const actionBarFrame = await page.waitForFrame((frame) => frame.name() === 'WorkspaceActionBarDoc');
  await actionBarFrame.waitForSelector('td[title="Approbation du relevé"]').then((el) => el!.click());

  const confirmationFrame = await page.waitForFrame((frame) => frame.name() === 'Confirmation');

  await confirmationFrame.waitForSelector('input[name="password"]').then(async (el) => {
    await el!.focus();
    await el!.click();
    await el!.type(password, { delay: 200 });
  });

  await confirmationFrame.waitForSelector('input[name="OK"]').then((el) => el!.click());

  // await new Promise((r) => setTimeout(r, 30000));

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
