"use client";

import { Button } from "@/components/ui/button";
import { usePostStore } from "@/stores/posts";
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
    const postStore = usePostStore((state) => state);
    const count = postStore.posts.filter(post => post.read && post.tags.length === 0).length;

    const CleanRecords = async() => {
        if(confirm && count > 0) {
            postStore.clean();
            cleanAll();
            setConfirm(false);
            setConfirmText("Clean All");
        } else {
            setConfirmText(`${count === 0 ? "No" : count} records to clean. ${count === 0 ? "" : "Confirm Clean All"}`);
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