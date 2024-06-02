'use server';

const getServerGenerations = async () => {
    console.log('getGenerations');
    const response = await fetch('http://140.245.24.43:8083/db');
    const data = await response.json();
    return data;
}


const setServerMarkAsRead = async (id: string) => {
    const response = await fetch(`http://140.245.24.43:8083/db/mark?id=${id}`, {
    });
}

const setServerMarkAsUnread = async (id: string) => {
    const response = await fetch(`http://140.245.24.43:8083/db/mark/unread?id=${id}`, {
    });
}




export {
    getServerGenerations,
    setServerMarkAsRead,
    setServerMarkAsUnread
}