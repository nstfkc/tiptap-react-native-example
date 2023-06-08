module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [["babel-plugin-inline-import", { extensions: [".html"] }]],
    presets: ["babel-preset-expo"],
  };
};
