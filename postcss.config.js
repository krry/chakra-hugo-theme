var url = require("postcss-url");
var imports = require("postcss-import");
var nested = require("postcss-nested");
var postCSSPresetEnv = require("postcss-preset-env");
var browsers = require("browserslist");
var cssnano = require("cssnano");
var color = require("postcss-color-mod-function");
var mixins = require("postcss-mixins");

module.exports = {
  plugins: [
    url(),
    imports({
      path: 'themes/chakra/assets/css'
    }),
    mixins(),
    nested(),
    postCSSPresetEnv({
      stage: 1,
    }),
    cssnano({
      preset: "default",
    }),
    color(),
  ],
};
