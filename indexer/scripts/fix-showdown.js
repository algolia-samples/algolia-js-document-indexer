import fs from 'fs';

const file1Path = 'node_modules/showdown/dist/showdown.js';
const file1Content = fs.readFileSync(file1Path, 'utf-8');
fs.writeFileSync(file1Path, file1Content.replace('if (limit === 10) {', 'if (limit === 1000) {'));

const file2Path = 'node_modules/showdown/dist/showdown.min.js';
const file2Content = fs.readFileSync(file2Path, 'utf-8');
fs.writeFileSync(file2Path, file2Content.replace('if(10===s)', 'if(1000===s)'));