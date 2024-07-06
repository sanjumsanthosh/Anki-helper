"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter, DialogTrigger, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect } from "react";
import { MdCastConnected } from "react-icons/md";
import { CompanionStore, useCompanionStore } from "@/stores/companionStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMermaidStore } from "@/stores/mermaidStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdditionalNodeLvlInfoType, ConfigurationMap } from "./mermaidDiag";
import { z } from "zod";
import { Logger } from "@/lib/logger";


interface CompanionConfiguratorProps {}

const CompanionConfigurator = ({}: CompanionConfiguratorProps) => {

    const companionStore = useCompanionStore(state => state);
    const mermaidStore = useMermaidStore(state => state);
    const [filesList, setFilesList] = React.useState<string[]>([]);
    const [attrs, setAttrs] = React.useState<z.infer<typeof AdditionalNodeLvlInfoType>>({});
    const gitRef = React.useRef<HTMLInputElement>(null);

    const checkHealth = async () => {
        companionStore.connector.checkConnection().then((result) => {
            companionStore.setHealthy(result);
        });
    }

    const getFilesList = async () => {
        companionStore.connector.listAll().then((result) => {
            setFilesList(result);
        });
    }

    const getAndConfigureDotAndJson = async () => {
        const dotFile = await companionStore.connector.getDot(companionStore.selectedFile);
        const jsonFile = await companionStore.connector.getJSON(companionStore.selectedFile) as z.infer<typeof AdditionalNodeLvlInfoType>;

        
        Logger.log("Got json file from companion", jsonFile);
        mermaidStore.mermaidDiagram.parseOverrideAttr(jsonFile);
        mermaidStore.setJsonFile(jsonFile);
        mermaidStore.setDotFile(dotFile);

        setAttrs(jsonFile);
    }

    useEffect(() => {
        if (companionStore.selectedFile !== "None") {
            getAndConfigureDotAndJson();
        }
    },[companionStore.selectedFile]);

    useEffect(() => {
        checkHealth();
        getFilesList();
    },[]);

    const syncUpConfigurations = async () => {
        const gitUrl = gitRef.current?.value;
        const combination = {
            ...mermaidStore.mermaidDiagram.getOverrideJSON(),
            ANKIConfig: {GIT_URL: gitUrl}
        }

        await companionStore.connector.saveJSON(companionStore.selectedFile, combination);
    }


    return (
        
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <MdCastConnected  className="h-4 w-4" />:
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>
                    Companion Configurator - Localhost
                </DialogTitle>
                <DialogDescription>
                    Use this dialog to configure the companion connector
                </DialogDescription>
                </DialogHeader>
                    <DropDownSelector fileList={["None",...filesList]} companionStore={companionStore} />
                    <div>
                        <Label>Git URL</Label>
                        <Input defaultValue={attrs.ANKIConfig?.GIT_URL || ""} ref={gitRef} />
                        
                    </div>
                    <Button onClick={syncUpConfigurations}>Sync</Button>
            </DialogContent>
        </Dialog>
    );
}


// Drop down selector

interface DropDownSelectorProps {
    fileList: string[];
    companionStore: CompanionStore;
}

const DropDownSelector = ({fileList, companionStore}: DropDownSelectorProps) => {
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
            {companionStore.selectedFile}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={companionStore.selectedFile} onValueChange={companionStore.setSelectedFile}>
          {
                fileList.map((file) => {
                    return <DropdownMenuRadioItem value={file} key={file}>{file}</DropdownMenuRadioItem>
                })
          }
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CompanionConfigurator;