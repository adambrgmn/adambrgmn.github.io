/* eslint-disable import/no-extraneous-dependencies, comma-dangle */
const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');
const hash = require('gulp-hash');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');
const postcssCssnext = require('postcss-cssnext');
const postcssBrowserReporter = require('postcss-browser-reporter');
const postcssReporter = require('postcss-reporter');
const cssnano = require('cssnano');
const webpack = require('webpack');
const imagemin = require('gulp-imagemin');
const favicons = require('gulp-favicons');

const server = require('./gulp/server');
const hugo = require('./gulp/hugo');

const webpackConfig = require('./webpack.config');

/**
 * PATHS
 */
const PATHS = {
  site: {
    src: 'site',
    dest: { DEV: '.temp', PROD: 'dist' },
    watch: 'site/**/*',
  },
  css: {
    src: 'src/css/*.css',
    dest: { DEV: '.temp/assets/css', PROD: 'site/static/assets/css' },
    watch: 'src/css/**/*.css',
  },
  js: {
    src: 'src/js/*.js',
    dest: { DEV: '.temp/assets/js', PROD: 'site/static/assets/js' },
    watch: 'src/js/**/*.js',
  },
  img: {
    src: 'src/img/**/*.{jpg,jpeg,png,gif,svg}',
    dest: { DEV: '.temp/assets/img', PROD: 'site/static/assets/img' },
    watch: 'src/img/**/*.{jpg,jpeg,png,gif,svg}',
  },
  favicon: {
    src: 'src/favicon.png',
    dest: 'site/static',
  },
  hash: 'site/data/hash',
};


/**
 * CLEAN
 */
const clean = () => del([
  PATHS.site.dest.DEV,
  PATHS.site.dest.PROD,
  PATHS.css.dest.PROD,
  PATHS.js.dest.PROD,
  PATHS.img.dest.PROD,
  'site/static/favicon*.*',
  PATHS.hash,
]);

const cleanPostProd = () => del([
  PATHS.css.dest.PROD,
  PATHS.js.dest.PROD,
  PATHS.hash,
  'site/static/favicon*.*',
]);


/**
 * HUGO
 */
const hugoDev = hugo({
  dest: PATHS.site.dest.DEV,
  src: PATHS.site.src,
  baseUrl: 'localhost:3000/',
  buildDrafts: true,
  buildFuture: true,
  noThrow: true,
});

const hugoProd = hugo({
  dest: PATHS.site.dest.PROD,
  src: PATHS.site.src,
  verbose: true,
});


/**
 * CSS
 */
const postcssPluginsCommon = [
  postcssImport(),
  postcssUrl(),
  postcssCssnext(),
];

const postcssPluginsDev = postcssPluginsCommon.concat([
  postcssBrowserReporter(),
  postcssReporter(),
]);

const postcssPluginsProd = postcssPluginsCommon.concat([
  cssnano({ autoprefixer: false }),
]);

const cssDev = () => gulp.src(PATHS.css.src)
  .pipe(sourcemaps.init())
  .pipe(postcss(postcssPluginsDev))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(PATHS.css.dest.DEV))
  .pipe(server.stream());

const cssProd = () => gulp.src(PATHS.css.src)
  .pipe(postcss(postcssPluginsProd))
  .pipe(hash())
  .pipe(gulp.dest(PATHS.css.dest.PROD))
  .pipe(hash.manifest('css.json'))
  .pipe(gulp.dest(PATHS.hash));


/**
 * JS
 */
const webpackTask = (env, opts) => (cb) => {
  webpack(
    webpackConfig(env, opts),
    (err, stats) => {
      if (err) throw new gutil.PluginError('webpack', err);
      gutil.log('webpack', stats.toString({ chunks: false, colors: true }));
      cb();
    }
  );
};

const jsDev = webpackTask('development', { outputPath: PATHS.js.dest.DEV });
jsDev.displayName = 'jsDev';
const jsProd = webpackTask('production', { outputPath: PATHS.js.dest.PROD });
jsProd.displayName = 'jsProd';

/**
 * IMAGES
 */
const imagesDev = () => gulp.src(PATHS.img.src, { since: gulp.lastRun(imagesDev) })
  .pipe(imagemin())
  .pipe(gulp.dest(PATHS.img.dest.DEV));

const imagesProd = () => gulp.src(PATHS.img.src)
  .pipe(imagemin())
  .pipe(gulp.dest(PATHS.img.dest.PROD));

/**
 * FAVICONS
 */
const faviconsProd = () => gulp.src(PATHS.favicon.src)
  .pipe(favicons({
    icons: {
      favicons: true,
      android: false,
      appleIcon: false,
      appleStartup: false,
      coast: false,
      firefox: false,
      windows: false,
      yandex: false,
    },
    logging: false,
    online: false,
  }))
  .on('error', err => gutil.log('favicons', err))
  .pipe(gulp.dest(PATHS.favicon.dest));


/**
 * WATCH
 */
const watch = () => {
  gulp.watch(PATHS.site.watch, gulp.series(hugoDev, server.reload));
  gulp.watch(PATHS.css.watch, cssDev);
  gulp.watch(PATHS.js.watch, gulp.series(jsDev, server.reload));
  gulp.watch(PATHS.img.watch, gulp.series(imagesDev, server.reload));
};

/**
 * BUILDS
 */
const buildDev = gulp.series(
  clean,
  hugoDev,
  gulp.parallel(cssDev, jsDev, imagesDev)
);

const buildProd = gulp.series(
  clean,
  gulp.parallel(cssProd, jsProd, imagesProd, faviconsProd),
  hugoProd,
  cleanPostProd
);

/**
 * MAIN TASKS
 */
exports.dev = gulp.series(buildDev, server.serve, watch);
exports.build = buildProd;


/**
 * OTHER TASKS
 */
exports.clean = clean;
exports.hugoDev = hugoDev;
exports.hugoProd = hugoProd;
exports.cssDev = cssDev;
exports.cssProd = cssProd;
exports.jsDev = jsDev;
exports.jsProd = jsProd;
