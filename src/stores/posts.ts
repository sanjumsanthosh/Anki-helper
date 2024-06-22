import { create } from 'zustand';
import { Post, Tag } from '@prisma/client';


export type PostState = {
  posts: ({tags: Tag[]}&Post)[],
  tags: Tag[],
  isPostInitialized: boolean,
  isTagInitialized: boolean,
  cleaningCount: number
}

export type PostActions = {
    setPosts: (posts: ({tags: Tag[]}&Post)[]) => void,
    setTags: (tags: Tag[]) => void,
    setPostInitialized: (isPostInitialized: boolean) => void
    setTagInitialized: (isTagInitialized: boolean) => void
    markAsRead: (id: string) => void,
    markAsUnread: (id: string) => void,
    updateServerTags: (id: string, tags: string[]) => void,
    clean: () => void
}

export type PostStore = PostState & PostActions;

export const usePostStore = create<PostStore>()((set) => ({
    posts: [],
    tags: [],
    isPostInitialized: false,
    isTagInitialized: false,
    cleaningCount: 0,
    setPosts: (posts: ({tags: Tag[]}&Post)[]) => set(() => ({ posts })),
    setTags: (tags: Tag[]) => set(() => ({ tags })),
    setPostInitialized: (isPostInitialized: boolean) => set(() => ({ isPostInitialized })),
    setTagInitialized: (isTagInitialized: boolean) => set(() => ({ isTagInitialized })),
    markAsRead: (id: string) => set((state) => {
        const postIndex = state.posts.findIndex(post => post.id === id);
        if (postIndex !== -1) {
            state.posts[postIndex].read = true;
        }
        state.setPosts(state.posts);
        return state;
    }),
    markAsUnread: (id: string) => set((state) => {
        const postIndex = state.posts.findIndex(post => post.id === id);
        if (postIndex !== -1) {
            state.posts[postIndex].read = false;
        }
        state.setPosts(state.posts);
        return state;
    }),
    updateServerTags: (id: string, tags: string[]) => set((state) => {
        console.log("updateServerTags", id, tags);
        const tagsSet = new Set(tags);
        const postIndex = state.posts.findIndex(post => post.id === id);
        if (postIndex !== -1) {
            state.posts[postIndex].tags = state.tags.filter(tag => tagsSet.has(tag.tag));
        }
        state.setPosts(state.posts);
        return state;
    }),
    clean: () => set((state) => {
        state.posts = state.posts.filter(post => !post.read || post.tags.length !== 0);
        state.setPosts(state.posts);
        return state;
    })

}));