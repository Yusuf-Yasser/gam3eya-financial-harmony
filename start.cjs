const { exec } = require('child_process');
const path = require('path');

// Start React app
const startReact = exec('npm run dev');
startReact.stdout.on('data', (data) => {
  console.log(`React App: ${data}`);
});
startReact.stderr.on('data', (data) => {
  console.error(`React App Error: ${data}`);
});

// Start Express server
const startServer = exec('node server/server.cjs');
startServer.stdout.on('data', (data) => {
  console.log(`Express Server: ${data}`);
});
startServer.stderr.on('data', (data) => {
  console.error(`Express Server Error: ${data}`);
});

console.log('Starting both the React app and Express server...');
console.log('Press Ctrl+C to stop both processes.');
