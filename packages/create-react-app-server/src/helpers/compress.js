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

// returns an array of files within a directory and all subdirectories
const getFiles = async ({ directory }) => {
  logger.debug(
    `${LOGGER_NAMESPACE}: getting files for directory: ${directory}`
  );

  const contents = await readdir(directory);
  const directories = [];
  const files = [];
  
  // iterate over contents of the directory
  for (const item of contents) {
    const itemPath = path.join(directory, item);

    // get the info for a given directory item
    const info = await stat(itemPath);

    // if the item is a directory, push it to an array we use later
    // and continue to the next tick of the loop
    if (info.isDirectory()) {
      directories.push(itemPath);

      continue;
    } else if (
      item.endsWith('.css') || item.endsWith('.html') || item.endsWith('.js')
    ) {
      files.push(itemPath);
    }
  }

  // if no directories then simply return all files
  if (!directories.length) {
    return(files);
  } else {
    logger.debug(
      `${LOGGER_NAMESPACE}: total subdirectories found: ${directories.length}`
    );
    
    // iterate over directories and get all files within
    for (const directory of directories) {
      const directoryFiles = await getFiles({ directory });

      // add all files from subdirectories to our array
      files.push(...directoryFiles);
    }

    return files;
  }
};

// returns a promise to compress a file.
export const compressFile = file => new Promise((resolve, reject) => {
  // brotli
  const brotiliFormattedContent = brotliCompress(fs.readFileSync(file), brotliSettings);
  fs.writeFileSync(`${file}.br`, brotiliFormattedContent);

  // gzip
  const gzipFormattedContent = fs.createReadStream(file);
  const writeStream = fs.createWriteStream(`${file}.gz`);
  const zip = zlib.createGzip();

  // collect errors
  const errors = [];

  gzipFormattedContent
    .pipe(zip)
    .on('error', error => errors.push(error.message))
    .pipe(writeStream)
    .on('error', error => errors.push(error.message));

  // if we have errors reject and the caller can decide how to handle.
  if (!errors.length) {
    logger.debug(`${LOGGER_NAMESPACE}: complete: ${file}`);
    resolve();
  } else {
    const errorMessage = errors.join(',');
    logger.error(`${LOGGER_NAMESPACE}: error: ${file}`, errorMessage);
    reject(errorMessage);
  }
});

// compress a single file or directory of files (handles subdirectories)
export default async ({
  // a directory of files to compress (supports subdirectories)
  directory,

  // if we want to use Promise.all when running compression on all files.
  // if someone has a zillion files and encounter an error - they can disable.
  concurrent = true,

  // to fail gracefully, set to true
  graceful = false,

  // a single file to compress
  file: filePath
}) => {
  logger.debug(`${LOGGER_NAMESPACE}: options`, {
    directory,
    concurrent,
    graceful,
    file: filePath
  });

  // if we have a single file
  if (filePath) {
    await compressFile(filePath);
    return;
  }

  const files = await getFiles({ directory });

  // if concurrency is disabled - synchronously compress each file
  if (!concurrent) {
    for (const file of files) {
      await compressFile(file);
    }
  } else {
    // concurrently compress files
    await Promise.all(
      files.map(file => compressFile(file).catch(error => {
        // if we should not fail gracefully
        if (!graceful) {
          throw error;
        }
      }))
    );
  }
};
