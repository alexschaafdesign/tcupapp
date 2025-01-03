import fs from 'fs';

const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export default ensureDirectoryExistence;