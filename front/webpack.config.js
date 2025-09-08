const createExpoWebpackConfigAsync = require('expo-webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Tambahkan custom config di sini jika perlu
  return config;
};
