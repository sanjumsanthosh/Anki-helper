"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { MdCancelPresentation } from "react-icons/md";

interface CleanAllProps {
    cleanAll: () => Promise<void>;
}
export default function CleanAll({cleanAll}: CleanAllProps) {

    const [confirm , setConfirm] = useState(false);

    const CleanRecords = async() => {
        if(confirm) {
            console.log("Cleaning all records");
            await cleanAll();
            setConfirm(false);
        } else {
            setConfirm(true);
        }
    }

    return (
        <Button onClick={() => CleanRecords()} variant={"destructive"} className="items-center justify-between">
            {confirm ? <FaCheck className="mr-2 h-4 w-4" /> : <FaRegTrashAlt className="mr-2 h-4 w-4" /> }
            {confirm ? "Are you sure?" : "Clean All"}
            {confirm && <MdCancelPresentation className="ml-5 h-4 w-4" onClick={()=>{setConfirm(false)}}/> }
        </Button>
    )
}