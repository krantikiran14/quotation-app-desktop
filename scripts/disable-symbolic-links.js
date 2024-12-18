const fs = require('fs');
const path = require('path');

module.exports = async function (context) {
  const { appOutDir } = context;
  const files = [
    'libcrypto.dylib',
    'libssl.dylib'
  ];
  files.forEach((file) => {
    const filePath = path.join(appOutDir, 'node_modules', 'winCodeSign', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);  // Remove any existing symbolic link
    }
  });
};