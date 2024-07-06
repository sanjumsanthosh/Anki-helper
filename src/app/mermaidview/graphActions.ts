import fs from 'fs';
import parse from 'dotparser';
import { DOT_FILE } from './constants';

function getDotFile() {
    const file =  fs.readFileSync(DOT_FILE, 'utf8');
    return file;
}

function parseDotFile(file?: string) {
    const dotFile = file || getDotFile();
    const ast = parse(dotFile);
    return ast;
}

export {
    parseDotFile
}

