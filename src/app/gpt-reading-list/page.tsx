import ShowGenerations from "./ShowGenerations";
import { getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread, updateServerTags, getTagList } from "../actions";
import Wrapper from "./wrapper";
import { Suspense } from "react";
import SingleTileView from "./SingleTileView";


export default function GPTReadingList() {
  return (
    <section className="flex flex-wrap flex-col lg:flex-row w-screen max-w-screen">
        <section className="flex h-full flex-col justify-between p-9 lg:h-auto">
            <Wrapper>
                <div className="mx-auto flex flex-col">
                  <Suspense>
                    <SingleTileView 
                        getServerGenerations={getServerGenerations}
                        setServerMarkAsRead={setServerMarkAsRead}
                        setServerMarkAsUnread={setServerMarkAsUnread}
                        updateServerTags={updateServerTags}
                        getTagList={getTagList}
                        />
                    </Suspense>
                </div>
            </Wrapper>
        </section>
    </section>
  );
}