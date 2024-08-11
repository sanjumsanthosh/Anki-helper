"use client";


import React, { useEffect, useRef, useState } from "react";
import mermaid from 'mermaid';
import BadgeBookmarkBox from "./BadgeBookmarkBox";
import BookMarkToggleButton from "./BookMarkToggleButton";
import DetailsExplorer from "./DetailsExplorer";
import { Button } from "@/components/ui/button";
import { VscCloseAll } from "react-icons/vsc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMermaidStore } from "@/stores/mermaidStore";
import { MermaidDiag } from "./mermaidDiag";
import CompanionConfigurator from "./CompanionConfigurator";
import CodeSearch from "./CodeSearch";


interface CodeViewProps {
    parseAndReturnSerial: (file: string) => Promise<Record<string, unknown>>;
}

export default function CodeView({ parseAndReturnSerial }: CodeViewProps) {

    const {mermaidDiag, setMermaidDiagram} = useMermaidStore(state => ({mermaidDiag: state.mermaidDiagram, setMermaidDiagram: state.setMermaidDiagram}));
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    const keyTracking = useMermaidStore(state => state.keyTracking);
    const [selectedNodeList, setSelectedNodeList] = useState(mermaidDiag.getNodeList([]));
    const [currentNode, setCurrentNode] = useState(mermaidDiag.getNodeList([])[0]);
    const companionStore = useMermaidStore(state => state);
    const [HistoryNode, setHistoryNode] = useState<string[]>([]);
    const [FutureNode, setFutureNode] = useState<string>();
    const selectedNode = HistoryNode.length > 0 ? HistoryNode[HistoryNode.length - 1] : '';

    const codeSearchRef = useRef(null);

    const m = mermaid.initialize({ startOnLoad: true });


    useEffect(() => {
        mermaidDiag.setCurrentNode(selectedNode);
    }, [currentNode, selectedNodeList, companionStore.dotFile, selectedNode]);

    
    useEffect(() => {
        const filteredNodeList = selectedNodeList.filter((node) => !bookmarks.includes(node));
        setSelectedNodeList(filteredNodeList);
    }, [bookmarks, companionStore.dotFile]);

    const setSelectedNode = (node: string) => {
        console.log('setSelectedNode called with node:', node);
    
        if (node === '') {
            console.log('Node is an empty string, returning early.');
            return;
        }
    
        if (selectedNodeList.includes(node)) {
            console.log('Node is already in selectedNodeList:', selectedNodeList);
            const filteredNodeList = selectedNodeList.filter((n) => n !== node);
            console.log('Filtered node list:', filteredNodeList);
            setSelectedNodeList([...filteredNodeList, node]);
            console.log('Updated selectedNodeList:', [...filteredNodeList, node]);
        } else {
            console.log('Node is not in selectedNodeList, adding node:', node);
        }
    
        if (!HistoryNode.includes(node)) {
            setHistoryNode([...HistoryNode, node]);
        }
        console.log('Updated HistoryNode:', [...HistoryNode, node]);
    }

    const clearAll = () => {
        setBookmarks([]);
        setSelectedNodeList([]);
    }

    useEffect(() => {
        const code = mermaidDiag.render(selectedNodeList, currentNode, companionStore.jsonFile);
        clearAll();
        parseAndReturnSerial(companionStore.dotFile).then((MermaidDiagSerial) => {
            const deserialized = MermaidDiag.deserialize(MermaidDiagSerial);
            setMermaidDiagram(deserialized);
            mermaidDiag.setCurrentNode(deserialized.getFullNodeList()[0]);
            mermaidDiag.parseOverrideAttr(companionStore.jsonFile);
            setCurrentNode(deserialized.getFullNodeList()[0]);
            setSelectedNodeList(deserialized.getFullNodeList().slice(0, 1));
        });
    }, [companionStore.dotFile]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'f') {
                event.preventDefault();
                if (codeSearchRef.current) {
                    (codeSearchRef.current as any).openSelectMenu();
                }
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                console.log(`Pressed ArrowLeft history.length = ${HistoryNode.length}`);
                if (history.length > 0) {
                    const oldNode = HistoryNode.pop();
                    console.log(`oldNode = ${oldNode}`);
                    if (oldNode && HistoryNode.length > 0) {
                        setFutureNode(oldNode);
                        setSelectedNode(HistoryNode[HistoryNode.length - 1]);
                    }
                }
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                console.log(`Pressed ArrowRight futureNode = ${FutureNode}`);
                if (FutureNode) {
                    setSelectedNode(FutureNode);
                    setFutureNode(undefined);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [HistoryNode]);

    return (
        <div className="my-1 w-auto h-full flex flex-col">
            <div className="flex justify-between p-1 items-center gap-3">
                <div className="w-2/3">
                    <CodeSearch ref={codeSearchRef} selectedNode={selectedNode} setSelectedNode={setSelectedNode}
                    mermaidDiag={mermaidDiag} jsonFile={companionStore.jsonFile} />
                </div>
                <CompanionConfigurator />
            </div>
            <DetailsExplorer selectedNode={selectedNode} />
        </div>
            
    );
}

