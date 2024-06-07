import ShowGenerations from "./ShowGenerations";
import { getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread, updateServerTags, getTagList } from "../actions";
import Wrapper from "./wrapper";


export default function GPTReadingList() {
  return (
    <section className="flex flex-wrap flex-col lg:flex-row w-screen max-w-screen">
        <section className="flex h-full flex-col justify-between p-9 lg:h-auto">
            <Wrapper>
                <div className="mx-auto flex flex-col">
                    <ShowGenerations 
                        getServerGenerations={getServerGenerations}
                        setServerMarkAsRead={setServerMarkAsRead}
                        setServerMarkAsUnread={setServerMarkAsUnread}
                        updateServerTags={updateServerTags}
                        getTagList={getTagList}
                        />
                </div>
            </Wrapper>
        </section>
    </section>
  );
}