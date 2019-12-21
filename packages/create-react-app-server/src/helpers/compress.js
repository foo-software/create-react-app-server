import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { compress as brotliCompress } from 'brotli';
import { promisify } from 'util';
import logger from '../logger';

// took this from here
// https://itnext.io/increase-node-js-server-performance-by-serving-smaller-faster-pre-compressed-brotli-gzipped-499c8da37f6c
// https://quixdb.github.io/squash-benchmark/#results-table
const brotliSettings = {
  extension: 'br',
  skipLarger: true,
  mode: 1, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 10, // 0 - 11,
  lgwin: 12 // default
};

const LOGGER_NAMESPACE = 'compress';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const getFiles = async ({ directory }) => {
  logger.debug(
    `${LOGGER_NAMESPACE}: getting files for directory: ${directory}`
  );

  const contents = await readdir(directory);
  const directories = [];
  const files = [];

  for (const item of contents) {
    const itemPath = path.join(directory, item);

    const info = await stat(itemPath);

    if (info.isDirectory()) {
      directories.push(itemPath);

      continue;
    } else if (
      item.endsWith('.css') || item.endsWith('.html') || item.endsWith('.js')
    ) {
      files.push(itemPath);
    }
  }

  if (!directories.length) {
    return(files);
  } else {
    logger.debug(
      `${LOGGER_NAMESPACE}: total directories found: ${directories.length}`
    );

    for (const directory of directories) {
      const directoryFiles = await getFiles({ directory });
      files.push(...directoryFiles);
    }

    return files;
  }
};

export default async ({ path }) => {
  const files = await getFiles({ directory: path });
  const errors = []

  for (const file of files) {
    // brotli
    const result = brotliCompress(fs.readFileSync(file), brotliSettings);
    fs.writeFileSync(`${file}.br`, result);

    // gzip
    const fileContents = fs.createReadStream(file);
    const writeStream = fs.createWriteStream(`${file}.gz`);
    const zip = zlib.createGzip();
    fileContents
      .pipe(zip)
      .on('error', error => errors.push(error.message))
      .pipe(writeStream)
      .on('error', error => errors.push(error.message));

    logger.debug(`${LOGGER_NAMESPACE}: compression complete: ${file}`);
  }
};
