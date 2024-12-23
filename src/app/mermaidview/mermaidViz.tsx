"use client";

import React, { useEffect, useState } from "react";
import mermaid from 'mermaid';
import BadgeBookmarkBox from "./BadgeBookmarkBox";
import BadgeBox from "./BadgeBox";
import BookMarkToggleButton from "./BookMarkToggleButton";
import DetailsExplorer from "./DetailsExplorer";
import { Button } from "@/components/ui/button";
import { VscCloseAll } from "react-icons/vsc";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMermaidStore } from "@/stores/mermaidStore";
import { MermaidDiag } from "./mermaidDiag";
import CompanionConfigurator from "./CompanionConfigurator";
import { MapInteractionCSS } from 'react-map-interaction';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

interface MermaidVizProps {
    parseAndReturnSerial: (file: string) => Promise<Record<string, unknown>>;
}

export default function MermaidViz({ parseAndReturnSerial }: MermaidVizProps) {
    const { mermaidDiag, setMermaidDiagram } = useMermaidStore(state => ({
        mermaidDiag: state.mermaidDiagram,
        setMermaidDiagram: state.setMermaidDiagram
    }));
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [svgCode, setSvgCode] = useState('');
    const [selectedNodeList, setSelectedNodeList] = useState(mermaidDiag.getNodeList([]));
    const [currentNode, setCurrentNode] = useState(mermaidDiag.getNodeList([])[0]);
    const companionStore = useMermaidStore(state => state);
    const keyTracking = useMermaidStore(state => state.keyTracking);

    const toggleBookmark = (node: string) => {
        if (bookmarks.includes(node)) {
            setBookmarks(bookmarks.filter((bookmark) => bookmark !== node));
            setSelectedNodeList([...selectedNodeList, node]);
        } else {
            setBookmarks([...bookmarks, node]);
        }
    };

    const toggleCurrentBookmark = () => {
        toggleBookmark(currentNode);
    };

    const generateSVG = async (code?: string) => {
        if (!code) return;
        try {
            const { svg } = await mermaid.render('graphDiv', code);
            setSvgCode(svg);
        } catch (error) {
            console.error("Error generating SVG", error);
        }
    };

    useEffect(() => {
        const code = mermaidDiag.render(selectedNodeList, currentNode, companionStore.jsonFile);
        generateSVG(code);
        mermaidDiag.setCurrentNode(currentNode);
    }, [currentNode, selectedNodeList, companionStore.dotFile]);

    useEffect(() => {
        const filteredNodeList = selectedNodeList.filter((node) => !bookmarks.includes(node));
        setSelectedNodeList(filteredNodeList);
    }, [bookmarks, companionStore.dotFile]);

    const clearAll = () => {
        setBookmarks([]);
        setSelectedNodeList([]);
    };

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
        }).catch(error => {
            console.error("Error parsing and returning serial", error);
        });
        generateSVG(code);
    }, [companionStore.dotFile]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            let ucn = currentNode;
            let unn = selectedNodeList;

            if (!keyTracking) return;

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                if (selectedNodeList.length > 0) {
                    const currentIndex = selectedNodeList.indexOf(currentNode);
                    if (currentIndex < selectedNodeList.length - 1) {
                        ucn = selectedNodeList[currentIndex + 1];
                        setCurrentNode(ucn);
                    } else {
                        ucn = selectedNodeList[0];
                        setCurrentNode(ucn);
                    }
                }
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                if (selectedNodeList.length > 0) {
                    const currentIndex = selectedNodeList.indexOf(currentNode);
                    if (currentIndex > 0) {
                        ucn = selectedNodeList[currentIndex - 1];
                        setCurrentNode(ucn);
                    } else {
                        ucn = selectedNodeList[selectedNodeList.length - 1];
                        setCurrentNode(ucn);
                    }
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                const additionalNodes = mermaidDiag.getToNodesOfParent(currentNode);
                unn = Array.from(new Set([...selectedNodeList, ...additionalNodes]));
                setSelectedNodeList(unn);
                setCurrentNode(additionalNodes[0]);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const additionalNodes = mermaidDiag.getFromNodesOfParent(currentNode);
                unn = Array.from(new Set([...selectedNodeList, ...additionalNodes]));
                setSelectedNodeList(unn);
                setCurrentNode(additionalNodes[0]);
            } else if (event.key === 'b') {
                event.preventDefault();
                if (selectedNodeList.length > 0) {
                    const currentIndex = selectedNodeList.indexOf(currentNode);
                    if (currentIndex > 0) {
                        ucn = selectedNodeList[currentIndex - 1];
                        setCurrentNode(ucn);
                    } else {
                        ucn = selectedNodeList[selectedNodeList.length - 1];
                        setCurrentNode(ucn);
                    }
                    toggleCurrentBookmark();
                }
            } else if (event.key === 'Backspace') {
                if (selectedNodeList.length > 0) {
                    const currentIndex = selectedNodeList.indexOf(currentNode);
                    if (currentIndex > 0) {
                        ucn = selectedNodeList[currentIndex - 1];
                        setCurrentNode(ucn);
                    } else {
                        ucn = selectedNodeList[selectedNodeList.length - 1];
                        setCurrentNode(ucn);
                    }
                    unn = selectedNodeList.filter((node) => node !== currentNode);
                    setSelectedNodeList(unn);
                }
            } else if (event.key === 'Enter') {
                event.preventDefault();
                navigator.clipboard.writeText(currentNode.split('__')[1]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentNode, selectedNodeList, bookmarks, keyTracking, companionStore.dotFile]);

    return (
        <div className="my-5 w-auto h-full flex flex-col">
            <div className="justify-around p-5 items-center gap-3">
                <div className="flex flex-col basis-3/4 grow">
                    <BadgeBox selectedNodeList={selectedNodeList} setSelectedNodeList={setSelectedNodeList} mermaidDiag={mermaidDiag} jsonFile={companionStore.jsonFile} />
                    <BadgeBookmarkBox bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
                </div>
                <BookMarkToggleButton currentNode={currentNode} bookmarks={bookmarks} toggleBookmark={toggleCurrentBookmark} />
                <CloseAllExceptCurrentButton currentNode={currentNode} selectedNodeList={selectedNodeList} setSelectedNodeList={setSelectedNodeList} />
                <CompanionConfigurator />
            </div>
            <ResizablePanelGroup
                direction="vertical"
                className="min-h-[200px] max-w rounded-lg border"
            >
                <ResizablePanel defaultSize={50}>
                    <div className="w-auto h-[400px]">
                        <MapInteractionCSS
                            showControls
                            minScale={2}
                            maxScale={1000}
                            defaultValue={{
                                scale: 2,
                                translation: { x: 0, y: 20 }
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: svgCode }} />
                        </MapInteractionCSS>
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <DetailsExplorer />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

interface CloseAllExceptCurrentButtonProps {
    currentNode: string;
    selectedNodeList: string[];
    setSelectedNodeList: (nodeList: string[]) => void;
}

const CloseAllExceptCurrentButton = ({ currentNode, selectedNodeList, setSelectedNodeList }: CloseAllExceptCurrentButtonProps) => {
    const closeAllExceptCurrent = () => {
        setSelectedNodeList([currentNode]);
    };
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={closeAllExceptCurrent} className="mx-3">
                        <VscCloseAll className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Close all except current node</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
