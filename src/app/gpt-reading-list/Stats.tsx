'use client'
import { useEffect, useState } from "react";
import { statType } from "./actions";
import { Label } from "@/components/ui/label";
import { IoIosRefreshCircle } from "react-icons/io";



interface StatsProps {
    stats : () => Promise<statType>
}
export default function Stats( {stats} : StatsProps) {

    const [data, setData] = useState<statType | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        stats().then((data) => {
            setData(data);
            setLoading(false);
        })
    }, [])

    const refreshData = () => {
        setLoading(true);
        stats().then((data) => {
            setData(data);
            setLoading(false);
        })
    }

    return (
    <div className="flex items-center p-4 rounded-lg">
        <Label className="mr-2 bg-blue-700 text-white px-2 py-1 rounded">Total Rows: {data?.rows.count}</Label>
        <Label className="mr-2 bg-green-700 text-white px-2 py-1 rounded">Unread/Read: {data?.unreadRows.count}/{data?.readRows.count}</Label>
        <Label className="mr-2 bg-blue-700 text-white px-2 py-1 rounded">Size: {data?.sizeInMB}</Label>
        <Label className="mr-2 bg-green-700 text-white px-2 py-1 rounded">Read with tags: {data?.readRowsButWithTags.count}</Label>
        <IoIosRefreshCircle onClick={refreshData} className={`ml-4 cursor-pointer text-green-500 w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
    </div>
    );
}

