import { Button } from "@/components/ui/button";
import { CiBookmark } from "react-icons/ci";
import { FcBookmark } from "react-icons/fc";

interface BookMarkToggleButtonProps {
    currentNode: string;
    bookmarks: string[];
    toggleBookmark: () => void;
}

const BookMarkToggleButton = ({currentNode, bookmarks, toggleBookmark}: BookMarkToggleButtonProps) => {
    const isBookMarked = ()=>{
        if (bookmarks.includes(currentNode)){
            return true;
        }
    }


    return (
        <Button variant="outline" size="icon" onClick={toggleBookmark}>
            {isBookMarked() ? 
                <FcBookmark  className="h-4 w-4" />:
                <CiBookmark  className="h-4 w-4" />
            }
        </Button>
    );
}


export default BookMarkToggleButton;