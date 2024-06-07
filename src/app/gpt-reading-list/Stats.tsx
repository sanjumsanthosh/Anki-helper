'use client'
import { useEffect, useState } from "react";
import { statType } from "../actions";
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg">
            <Label onClick={refreshData} className="mr-2 bg-blue-700 text-white px-2 py-2 rounded items-center">
                <span className="hidden md:inline">Total Rows: </span>
                <span className="md:hidden">T: </span>
                {data?.rows.count}
            </Label>
            <Label onClick={refreshData} className="mr-2 bg-green-700 text-white px-2 py-2 rounded">
                <span className="hidden md:inline">Unread/Read: </span>
                <span className="md:hidden">UR/R: </span>
                {data?.unreadRows.count}/{data?.readRows.count}
            </Label>
            <Label onClick={refreshData} className="mr-2 bg-blue-700 text-white px-2 py-2 rounded">
                <span className="hidden md:inline">Size: </span>
                <span  className="md:hidden">Sz: </span>
                {data?.sizeInMB}
            </Label>
            <Label onClick={refreshData} className="mr-2 bg-green-700 text-white px-2 py-2 rounded">
                <span className="hidden md:inline">Read with tags: </span>
                <span className="md:hidden">RT: </span>
                {data?.readRowsButWithTags.count}
            </Label>
            <IoIosRefreshCircle onClick={refreshData} className={`hidden md:inline ml-4 cursor-pointer text-green-500 w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
        
        </div>
    );
}

