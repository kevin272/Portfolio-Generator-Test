import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

export async function createZipFromDirectory(sourceDir, outputFile) {
  await fs.mkdir(path.dirname(outputFile), { recursive: true });

  return new Promise((resolve, reject) => {
    const zipProcess = spawn('zip', ['-r', outputFile, '.'], {
      cwd: sourceDir,
      stdio: 'ignore',
    });

    zipProcess.on('error', reject);
    zipProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputFile);
      } else {
        reject(new Error(`zip command exited with code ${code}`));
      }
    });
  });
}
