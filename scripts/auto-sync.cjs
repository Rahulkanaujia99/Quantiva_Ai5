const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const fallbackGitPath = 'C:\\Users\\RahulKanaujia\\AppData\\Local\\Programs\\Git\\cmd\\git.exe';
const workspaceDir = path.join(__dirname, '..');

function runCmd(args) {
  return new Promise((resolve) => {
    exec(`git ${args}`, { cwd: workspaceDir }, (error, stdout) => {
      if (error) {
        exec(`"${fallbackGitPath}" ${args}`, { cwd: workspaceDir }, (fallbackError, fallbackStdout) => {
          if (fallbackError) {
            console.error(`Error running git ${args}:`, fallbackError.message);
            resolve(null);
          } else {
            resolve(fallbackStdout.trim());
          }
        });
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// Debounce commits so multiple file changes at once trigger a single push
let timeoutId = null;
const delay = 5000; // 5 seconds of silence before commit/push
const ignoredPaths = ['node_modules', '.git', 'dist', '.gemini', 'auto-sync.js', 'auto-sync.cjs', 'package-lock.json'];

async function sync(changedFile) {
  console.log(`\n--- Auto-Sync Triggered by: ${changedFile} ---`);
  
  // Check status
  const gitStatus = await runCmd('status --short');
  if (gitStatus === null) {
    console.log('Unable to run git commands. Verify git installation.');
    return;
  }
  
  if (gitStatus === '') {
    console.log('No local changes to sync.');
    return;
  }

  console.log('Staging changes...');
  await runCmd('add .');
  
  const commitMsg = `Auto-update from Antigravity: ${changedFile}`;
  console.log(`Committing: "${commitMsg}"`);
  await runCmd(`commit -m "${commitMsg}"`);
  
  console.log('Pushing to GitHub...');
  const pushResult = await runCmd('push origin main');
  if (pushResult !== null) {
    console.log('Push complete!');
  } else {
    console.log('Push failed. Make sure you set your remote origin and credentials are configured.');
  }
}

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  return ignoredPaths.some(ignored => parts.includes(ignored));
}

console.log('Starting file watcher for Auto-Sync...');
console.log(`Watching directory: ${workspaceDir}`);

fs.watch(workspaceDir, { recursive: true }, (eventType, filename) => {
  if (!filename || shouldIgnore(filename)) return;
  
  console.log(`[${eventType}] ${filename}`);
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => sync(filename), delay);
});
