import fs from 'fs';
import parse from 'dotparser';


function parseDotFile(file?: string) {
    const dotFile = file || ""
    const ast = parse(dotFile);
    return ast;
}

export {
    parseDotFile
}

