/**
 * Every .js-file that resides inside "src/js" will be taken
 * cared of by webpack 2 and Babel and can be referenced in
 * your HTML via "/assets/js/[filename].js".
 *
 * Inside here you can use all "ES2015 and beyond"-code.
 *
 *
 * babel-polyfill is included to provide useful polyfills
 * for features not available in older browsers. By default
 * frans-hugo is setup to traspile your javascript to
 * function in "last 2 versions" with at least < 5% global
 * usage. If you want to raget even older browsers update
 * the settings in ".babelrc" (https://babeljs.io/docs/plugins/preset-env/)
 * "babel-preset-env" will also make sure to only include
 * those polyfills that are needed for your targeted browsers
 */
import 'babel-polyfill';

console.log('Hello Frans Hugo');
