import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input";
import { AdditionalNodeLvlInfoType, NodeAttrType } from "./mermaidDiag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useMermaidStore } from "@/stores/mermaidStore";
import { useCompanionStore } from "@/stores/companionStore";
import { z } from "zod";
import React from "react";

interface DetailsExplorerProps {
}

const DetailsExplorer = ({}: DetailsExplorerProps) => {

    const {mermaidDiagram, jsonFile} = useMermaidStore(state => ({mermaidDiagram: state.mermaidDiagram, jsonFile: state.jsonFile}));
    const attribute = mermaidDiagram.getAttrOfNode(mermaidDiagram.currentNode, jsonFile);
    let emgithubIframeLink = attribute.emgithubIframeLink;
    const linkFromLabel = (label: string|undefined) => {
        if (!label) return '';
        const paths = label.split('.');
        return `${jsonFile.GIT_URL}${paths.join('/')}.py`;
    }
    return (
        <Card className="m-5 flex-1">
        <CardHeader>
            <CardTitle>
                <Link href={linkFromLabel(attribute.label)} passHref target="_blank" className={
                    cn(buttonVariants({ variant: "link", size: "xl" }), "text-2xl")}>
                    {attribute.label}
                </Link>
            </CardTitle>
            <CardDescription>{attribute.relativePath}:{attribute.lineNo}</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="summary" className="h-full">
                <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="code">Code Block</TabsTrigger>
                </TabsList>
                <TabsContent value="code" className="h-[300px]">
                    {emgithubIframeLink && <iframe className="w-full h-full" allow="clipboard-write" src={attribute.emgithubIframeLink}/>}
                </TabsContent>
                <TabsContent value="summary">
                    <DetailsFormTable/>
                </TabsContent>
            </Tabs>
        </CardContent>
        </Card>
    );
}

interface DetailsFormTableProps {
}

const DetailsFormTable = ({}: DetailsFormTableProps) => {
    return (
        <div className="flex flex-row gap-4 w-full items-center justify-between">
            <div>
                <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <PopupEditableDialogComponent k={"description"} textarea/>
                </div>
            </div>
        </div>
    );
}


interface PopupEditableDialogProps {
    k: keyof typeof NodeAttrType;
    textarea?: boolean;
}
 
function PopupEditableDialogComponent({ k, textarea}: PopupEditableDialogProps) {

    const {mermaidDiagram, jsonFile, setJsonFile} = useMermaidStore(state => ({mermaidDiagram: state.mermaidDiagram, jsonFile: state.jsonFile, setJsonFile: state.setJsonFile}));
    const companionStore = useCompanionStore(state => state);
    const attr = mermaidDiagram.getAttrOfNode(mermaidDiagram.currentNode, jsonFile);
    const setKeyTracking = useMermaidStore(state => state.setKeyTracking);
    const currentValue = attr[k as keyof typeof attr];
    const [open, setOpen] = useState(false);
    const ref = useRef<any>(null);


    useEffect(() => {
        setKeyTracking(!open);
    }, [open]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newValue = ref.current?.value;
        mermaidDiagram.updateOrCreateOverrideAttr({...attr, [k]: newValue});
        const combination = {
            ...jsonFile,
            ...mermaidDiagram.getOverrideJSON()
        }
        mermaidDiagram.updateOrCreateOverrideAttr({...attr, [k]: newValue});
        companionStore.connector.saveJSON(companionStore.selectedFile, combination);
        setOpen(false);
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault();
            const newValue = ref.current?.value;
            mermaidDiagram.updateOrCreateOverrideAttr({...attr, [k]: newValue});
            const combination = {
                ...jsonFile,
                ...mermaidDiagram.getOverrideJSON()
            } as z.infer<typeof AdditionalNodeLvlInfoType>;
            setJsonFile(combination);
            companionStore.connector.saveJSON(companionStore.selectedFile, combination);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <div className="text-left text-wrap">
                        {(currentValue || "").toLocaleString().split('\n').map((line, index) => (
                            <span key={index}>
                                {line}
                                {index < (currentValue || "").toLocaleString().split('\n').length - 1 && <br />}
                            </span>
                        ))}
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit} id="yourFormId"> 
                    <DialogHeader>
                        <DialogTitle>{k}</DialogTitle>
                        <DialogDescription>
                            {k} of {attr.label}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Value
                            </Label>
                            {textarea ? <Textarea 
                                id="link"
                                name="link"
                                defaultValue={currentValue?.toLocaleString()}
                                placeholder="Enter a value"
                                onKeyDown={handleKeyPress}
                                ref={ref}
                            />:<Input
                                id="link"
                                name="link"
                                defaultValue={currentValue?.toLocaleString()}
                                onKeyDown={handleKeyPress}
                                ref={ref}
                            /> }
                        </div>
                        <Button type="submit" size="sm" className="px-3" variant="success">
                            <span>Update</span>
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start my-5">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default DetailsExplorer;