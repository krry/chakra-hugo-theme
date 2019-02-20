module.exports = {
  plugins: [
    require("postcss-url")(/*{ options }*/),
    require("postcss-import")({
      root: './themes/chakra',
      path: ['assets/css']
    }),
    require("postcss-normalize")(/*{ options }*/),
    require("postcss-mixins")(/*{ options }*/),
    require("postcss-nested")(/*{ options }*/),
    require("postcss-color-mod-function")(/*{ options }*/),
    require("postcss-preset-env")({
      stage: 1,
    }),
    require("autoprefixer")(/*{ options }*/),
    // require("cssnano")({
    //   preset: "default",
    // }),
  ],
};
