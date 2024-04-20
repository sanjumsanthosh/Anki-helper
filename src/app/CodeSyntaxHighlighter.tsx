'use client';

import { useCounterStore } from "@/provider/result-provider";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";



export default function CodeSyntaxHighlighter() {
    SyntaxHighlighter.registerLanguage('json', json);

    const {  status} = useCounterStore(
        (state) => state,
      )

    const properStringify = (status: string) => {
        try {
            return JSON.stringify(JSON.parse(status), null, 2)
        } catch (e) {
            return status
        }
    }

    return (
        <div className="w-[50vw] overflow-x-hidden overflow-y-auto p-2">
            <SyntaxHighlighter language={json} style={a11yDark}  showLineNumbers wrapLines wrapLongLines >
                {properStringify(status)}
            </SyntaxHighlighter>
        </div>
    );
}