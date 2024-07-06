import Wrapper from "./wrapper";

import { parseDotFile } from "./graphActions";
import { MermaidDiag } from "./mermaidDiag";
import MermaidViz from "./mermaidViz";

export default function MermaidView() {
    async function parseAndReturnSerial(file: string) {
        "use server"
        try{
            const dotFile = parseDotFile(file);
            const mermaidDiag = new MermaidDiag();
            mermaidDiag.parseGraph(dotFile);
            return mermaidDiag.serialize();
        } catch (e) {
            return {};
        }
        
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