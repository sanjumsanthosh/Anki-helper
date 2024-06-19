"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { MdCancelPresentation } from "react-icons/md";

interface CleanAllProps {
    cleanAll: () => Promise<void>;
    cleanAllCount: () => Promise<number>;
}
export default function CleanAll({cleanAll, cleanAllCount}: CleanAllProps) {

    const [confirm , setConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState("Clean All" as string | undefined);

    const CleanRecords = async() => {
        if(confirm) {
            await cleanAll();
            setConfirm(false);
            setConfirmText("Clean All");
        } else {
            const count = await cleanAllCount();
            setConfirmText(`Clean All (${count}) records?`);
            setConfirm(true);
        }
    }

    return (
        <div className="flex items-center justify-between">
            <Button onClick={() => CleanRecords()} variant={"destructive"} className="items-center justify-between">
                {confirm ? <FaCheck className="mr-2 h-4 w-4" /> : <FaRegTrashAlt className="mr-2 h-4 w-4" />}
                {confirmText}
            </Button>
            {confirm && <MdCancelPresentation className="ml-5 h-4 w-4" onClick={()=>{
                setConfirm(false);
                setConfirmText("Clean All");
            }}/> }
        </div>
    )
}