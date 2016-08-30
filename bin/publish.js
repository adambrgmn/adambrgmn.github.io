#!/usr/bin/env node

// const inquirer = require('inquirer');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const exec = require('child-process-promise').exec;
const path = require('path');
const cheerio = require('cheerio');

const rootDir = path.join(__dirname, '..');

const readIndex = () => {
  const indexPath = path.join(rootDir, 'build', 'index.html');
  return fs.readFileAsync(indexPath);
};

const transformPaths = content => {
  const $ = cheerio.load(content.toString());
  const $scriptTags = $('script');
  const $cssLinks = $('link').not(function not() {
    const href = $(this).attr('href');
    return href.match('http');
  });

  $scriptTags.each(function find() {
    const src = $(this).attr('src');
    return $(this).attr('src', path.join('/build', src));
  });

  $cssLinks.each(function eachCss() {
    const href = $(this).attr('href');
    return $(this).attr('href', path.join('/build', href));
  });

  return Promise.resolve($.html());
};

const writeToIndex = content => {
  const file = path.join(rootDir, 'index.html');
  return fs.writeFileAsync(file, content, 'utf-8');
};

const checkIfOnMaster = () => new Promise((resolve, reject) => {
  exec('git rev-parse --abbrev-ref HEAD', { cwd: rootDir })
    .then(({ stdout }) => {
      const branch = stdout.trim();
      if (branch === 'master') return resolve();
      const e = new Error(
        'Even though everything is setup you have to be on branch master to push to GitHub'
      );
      return reject(e);
    });
});

const addChanges = () => exec('git add --all', { cwd: rootDir });
const commitChanges = () => exec('git commit -m "Project built"', { cwd: rootDir });
const pushToOrigin = () => exec('git push -u origin master', { cwd: rootDir });

exec('npm run build', { cwd: rootDir })
  .then(readIndex)
  .then(transformPaths)
  .then(writeToIndex)
  .then(checkIfOnMaster)
  .then(addChanges)
  .then(commitChanges)
  .then(pushToOrigin)
  .then(() => console.log('All done!'))
  .catch(err => console.error(`${err.name}: ${err.message}`));
