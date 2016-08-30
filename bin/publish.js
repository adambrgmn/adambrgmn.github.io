#!/usr/bin/env node

const inquirer = require('inquirer');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const exec = require('child-process-promise').exec;
const path = require('path');
const cheerio = require('cheerio');

const readIndex = () => {
  const indexPath = path.join(__dirname, '..', 'build', 'index.html');
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
  const file = path.join(__dirname, '..', 'index.html');
  return fs.writeFileAsync(file, content, 'utf-8');
};

const questions = [
  {
    type: 'confirm',
    name: 'onMaster',
    message: 'Are you on branch master?',
    default: false,
  },
];

inquirer
  .prompt(questions)
  .then(answers => console.log(answers));

// exec('webpack')
//   .then(readIndex)
//   .then(transformPaths)
//   .then(writeToIndex)
//   .then(() => console.log('All done!'))
//   .catch(err => console.error('Error:', err));
