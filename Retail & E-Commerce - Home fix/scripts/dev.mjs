import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  {
    name: 'backend',
    args: ['--prefix', 'backend', 'run', 'start'],
  },
  {
    name: 'frontend',
    args: ['--prefix', 'frontend', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'],
  },
];

const running = processes.map(({ name, args }) => {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
});

process.on('SIGINT', () => {
  for (const child of running) {
    child.kill('SIGINT');
  }
  process.exit(0);
});
