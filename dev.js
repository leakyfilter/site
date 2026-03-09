const { spawn } = require('child_process');

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${name} exited with signal ${signal}`);
      return;
    }

    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
      shutdown();
    }
  });

  return child;
}

const children = [
  run('content', 'node', ['build-content.js', '--watch']),
  run('esbuild', 'npx', [
    'esbuild',
    'main.jsx',
    '--bundle',
    '--outfile=dist/bundle.js',
    '--format=iife',
    '--sourcemap',
    '--watch',
  ]),
];

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
