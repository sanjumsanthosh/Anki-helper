'use server';

// const URL = "http://140.245.24.43:8083";
const URL = "http://localhost:8083";

const getServerURL = (path: string) => {
    return `${URL}${path}`;
}


const getServerGenerations = async () => {
    console.log('getGenerations');
    const response = await fetch(getServerURL('/db'));
    const data = await response.json();
    return data;
}


const setServerMarkAsRead = async (id: string) => {
    const response = await fetch(getServerURL(`/db/mark?id=${id}`), {
    });
}

const setServerMarkAsUnread = async (id: string) => {
    const response = await fetch(getServerURL(`/db/mark/unread?id=${id}`), {
    });
}

//         if (url.pathname === "/db/tag" && req.method === "POST") {
    // const tags = url.searchParams.get("tags") || "";
    // const id = url.searchParams.get("id");

const updateServerTags = async (id: string, tags: string[]) => {
    const response = await fetch(getServerURL(`/db/tag?id=${id}&tags=${tags.join(",")}`), {
        method: "POST"
    });
}



export {
    getServerGenerations,
    setServerMarkAsRead,
    setServerMarkAsUnread,
    updateServerTags
}