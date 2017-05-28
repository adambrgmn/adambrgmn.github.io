/* eslint-disable import/no-extraneous-dependencies */
const browserSync = require('browser-sync');

const server = browserSync.create();

const reload = (done) => {
  server.reload();
  done();
};

const stream = () => server.stream();

const serve = (done) => {
  server.init({ server: './.temp' });
  done();
};

exports.reload = reload;
exports.stream = stream;
exports.serve = serve;
