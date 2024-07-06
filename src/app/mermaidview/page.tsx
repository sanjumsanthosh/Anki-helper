import Wrapper from "./wrapper";

import { parseDotFile } from "./graphActions";
import { MermaidDiag } from "./mermaidDiag";
import MermaidViz from "./mermaidViz";
import { Logger } from "@/lib/logger";

export default function MermaidView() {
    const dotFile = parseDotFile();
    const mermaidDiag = new MermaidDiag();
    mermaidDiag.parseGraph(dotFile);

    async function parseAndReturnSerial(file: string) {
        "use server"
        const dotFile = parseDotFile(file);
        const mermaidDiag = new MermaidDiag();
        mermaidDiag.parseGraph(dotFile);
        return mermaidDiag.serialize();
    }


    return (
    <section className="flex flex-wrap flex-col lg:flex-row w-screen max-w-screen h-screen">
        <section className="flex h-full flex-col justify-between p-9 lg:h-auto w-screen">
            <Wrapper>
                <div className="mx-auto w-full h-full">
                    <MermaidViz parseAndReturnSerial={parseAndReturnSerial} />
                </div>
            </Wrapper>
        </section>
    </section>
    )
    
}