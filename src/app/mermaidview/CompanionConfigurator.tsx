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
import Select from 'react-select'

interface CompanionConfiguratorProps {}

// Component to configure the companion connector
const CompanionConfigurator = ({}: CompanionConfiguratorProps) => {

    const companionStore = useCompanionStore(state => state);
    const mermaidStore = useMermaidStore(state => state);
    const [filesList, setFilesList] = React.useState<string[]>([]);
    const [attrs, setAttrs] = React.useState<z.infer<typeof AdditionalNodeLvlInfoType>>({});
    const gitRef = React.useRef<HTMLInputElement>(null);

    // Function to check the health of the companion connector
    const checkHealth = async () => {
        try {
            const result = await companionStore.connector.checkConnection();
            companionStore.setHealthy(result);
        } catch (error) {
            Logger.error("Error checking health", error);
        }
    }

    // Function to get the list of files from the companion connector
    const getFilesList = async () => {
        try {
            const result = await companionStore.connector.listAll();
            setFilesList(result);
        } catch (error) {
            Logger.error("Error getting files list", error);
        }
    }

    // Function to get and configure the dot and json files from the companion connector
    const getAndConfigureDotAndJson = async () => {
        try {
            const dotFile = await companionStore.connector.getDot(companionStore.selectedFile);
            const jsonFile = await companionStore.connector.getJSON(companionStore.selectedFile) as z.infer<typeof AdditionalNodeLvlInfoType>;

            Logger.log("Got json file from companion", jsonFile);
            mermaidStore.mermaidDiagram.parseOverrideAttr(jsonFile);
            mermaidStore.setJsonFile(jsonFile);
            mermaidStore.setDotFile(dotFile);

            setAttrs(jsonFile);
        } catch (error) {
            Logger.error("Error getting and configuring dot and json files", error);
        }
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

    // Function to sync up configurations with the companion connector
    const syncUpConfigurations = async () => {
        try {
            const gitUrl = gitRef.current?.value;
            const combination = {
                ...mermaidStore.mermaidDiagram.getOverrideJSON(),
                ANKIConfig: {GIT_URL: gitUrl}
            }

            await companionStore.connector.saveJSON(companionStore.selectedFile, combination);
        } catch (error) {
            Logger.error("Error syncing up configurations", error);
        }
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

// Drop down selector component
interface DropDownSelectorProps {
    fileList: string[];
    companionStore: CompanionStore;
}

const DropDownSelector: React.FC<DropDownSelectorProps> = ({ fileList, companionStore }) => {
    const selectOptions = fileList.map((file) => ({ value: file, label: file }));
  
    return (
      <Select
        value={selectOptions.find(option => option.value === companionStore.selectedFile)}
        onChange={(selectedOption) => {
          if (selectedOption) {
            companionStore.setSelectedFile(selectedOption.value);
          }
        }}
        options={selectOptions}
        placeholder="Select File"
        theme={(theme) => {
            return {
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary: 'hsl(0, 0%, 90%)',
                primary75: 'hsl(0, 0%, 80%)',
                primary50: 'hsl(0, 0%, 70%)',
                primary25: 'hsl(0, 0%, 60%)',
                danger: "#DE350B",
                dangerLight: "#FFBDAD",
                neutral0: "hsl(0, 0%, 0%)",
                neutral5: "hsl(0, 0%, 5%)",
                neutral10: "hsl(0, 0%, 10%)",
                neutral20: "hsl(0, 0%, 20%)",
                neutral30: "hsl(0, 0%, 30%)",
                neutral40: "hsl(0, 0%, 40%)",
                neutral50: "hsl(0, 0%, 50%)",
                neutral60: "hsl(0, 0%, 60%)",
                neutral70: "hsl(0, 0%, 70%)",
                neutral80: "hsl(0, 0%, 80%)",
                neutral90: "hsl(0, 0%, 90%)"
            },
            };
          }}
      />
    );
};

export default CompanionConfigurator;
