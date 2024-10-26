'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LegacyRef, use, useCallback, useEffect, useRef, useState } from 'react';
import {z} from 'zod';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import Select, { StylesConfig } from 'react-select'
import chroma from "chroma-js";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Logger } from '@/lib/logger';
import { Post, Tag } from '@prisma/client';
import remarkGfm from 'remark-gfm'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {a11yDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { usePostStore } from '@/stores/posts';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { TableStore, useTableStore } from '@/stores/tableState';
import { useKeyboardShortcut } from '@/hooks/keyboardShortcutHook';
import readingTime from 'reading-time';

const LOGGER_TAG = 'SingleTileView';

const optionType = z.object({
    value: z.string(),
    label: z.string(),
    color: z.string()
})

const mapExistingTags = (options: Tag[], tags: Tag[]) => {
    const tagsArray = tags.map(tag => tag.tag);
    return options.filter(option => tagsArray.includes(option.tag)).map(option => {
        return {
            value: option.tag,
            label: option.label,
            color: option.color
        }
    });
}

const getBorderColor = (options: Tag[],tags: Tag[]) => {
    const optionsArray = options.filter(option => tags.map(tag => tag.tag).includes(option.tag));

    if (optionsArray.length === 0) {
        return;
    }
    if (optionsArray.length === 1) {
        return optionsArray[0].color;
    }
    const colors = optionsArray.map(option => option.color).filter(color => color !== null) as string[];
    const mix = chroma.average(colors);
    return mix.css() as string;
}


const customStyles: StylesConfig<z.infer<typeof optionType>, true> = {
    control: (styles) => ({ ...styles, backgroundColor: 'transparent',border: 'none', color: '#FFFFFF'}),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? data.color
          : isFocused
          ? color.alpha(0.1).css()
          : undefined,
        color: isDisabled
          ? '#ccc'
          : isSelected
          ? chroma.contrast(color, 'white') > 2
            ? 'white'
            : 'black'
          : data.color,
        cursor: isDisabled ? 'not-allowed' : 'default',
  
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled
            ? isSelected
              ? data.color
              : color.alpha(0.3).css()
            : undefined,
        },
      };
    },
    multiValue: (styles, { data }) => {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: color.alpha(0.1).css(),
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: data.color,
      ':hover': {
        backgroundColor: data.color,
        color: 'white',
      },
    }),
  };

interface ServerGenerationsType {
    getServerGenerations: () => Promise<({tags: Tag[]}&Post)[]>;
    setServerMarkAsRead: (id: string) => Promise<void>;
    setServerMarkAsUnread: (id: string) => Promise<void>;
    updateServerTags: (id: string, tags: string[]) => Promise<void>;
    getTagList: () => Promise<Tag[]>;
}

export default function SingleTileView({getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread, updateServerTags, getTagList}: ServerGenerationsType) {

    const postStore = usePostStore((state)=>state);
    const tableStore = useTableStore((state)=>state);
    const searchParam = useSearchParams();
    const gotoID = searchParam.get('id');
    const [attempts, setAttempts] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [redirectOnce, setRedirectOnce] = useState(false);
    const [postId, setPostId] = useState('');
    const [postIndex, setPostIndex] = useState(0);

    const refs = useRef<{ [key: string]: React.RefObject<any> }>({});
    
    const tagSelectRef = React.createRef<any>();

    // Function to get server generations
    const getGenerations = async () => {
        try {
            if(!postStore.isPostInitialized){
                const response = await getServerGenerations();
                postStore.setPosts(response);
                postStore.setPostInitialized(true);
            }
        } catch (error) {
            Logger.error(`${LOGGER_TAG} - Error fetching server generations`, error);
            throw error;
        }
    }

    // Function to process tag list
    const processTagList = async () => {
        try {
            if (!postStore.isTagInitialized) {
                const response = await getTagList();
                postStore.setTags(response);
                postStore.setTagInitialized(true);
            }
        } catch (error) {
            Logger.error(`${LOGGER_TAG} - Error fetching tag list`, error);
            throw error;
        }
    }

    // Function to update server tags
    const updateServerTagWrapper = async (id: string, tags: string[]) => {
        try {
            postStore.updateServerTags(id, tags);
            await updateServerTags(id, tags);
        } catch (error) {
            Logger.error(`${LOGGER_TAG} - Error updating server tags`, error);
            throw error;
        }
    }

    // Function to mark a post as read
    const markAsRead = async (id: string) => {
        try {
            postStore.markAsRead(id);
            await setServerMarkAsRead(id);
        } catch (error) {
            Logger.error(`${LOGGER_TAG} - Error marking post as read`, error);
            throw error;
        }
    }

    // Function to mark a post as unread
    const markAsUnread = async (id: string) => {
        try {
            postStore.markAsUnread(id);
            await setServerMarkAsUnread(id);
        } catch (error) {
            Logger.error(`${LOGGER_TAG} - Error marking post as unread`, error);
            throw error;
        }
    }

    useEffect(() => {
        if (gotoID || tableStore.focusedId) {
            if (!redirectOnce && postStore.posts.length > 0) {
                // if gotoID exist use that. also if its not the same as tableStore.focusedId set it to gotoID
                // if tableStore.focusedId is set but gotoID is not set, use tableStore.focusedId

                if (gotoID) {
                    tableStore.setFocusedId(gotoID);
                    setPostId(gotoID);
                    setPostIndex(postStore.posts.findIndex(post => post.id === gotoID));
                    setRedirectOnce(true);
                } else if (tableStore.focusedId) {
                    setPostId(tableStore.focusedId);
                    setPostIndex(postStore.posts.findIndex(post => post.id === tableStore.focusedId));
                    setRedirectOnce(true);
                }
            }
        } else if (gotoID && attempts < 10) {
            // If the ref is not ready and attempts are less than 10, try again after a delay
            setTimer(setTimeout(() => {
                setAttempts(attempts + 1);
            }, 500)); // 500ms delay
        }
    }, [postStore.posts, gotoID, attempts]);

    useEffect(() => {
        getGenerations();
        processTagList();
    }   , [gotoID])

    useEffect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        }
    }, [timer]);

    if (postStore.isPostInitialized === false || postStore.isTagInitialized === false || postStore.posts[postIndex] === undefined ) {
        return <h1>Loading...</h1>
    }

    return (
        <div>
            <h1 className="text-2xl">Generations</h1>
            {postStore.posts.length > postIndex && (
                <>
                <NavigateNextAndPrevious setPostIndex={setPostIndex} postIndex={postIndex} postStore={postStore} tableStore={tableStore} />
                <CardWithTags 
                    refer={refs.current[postStore.posts[postIndex].id]}
                    key={postIndex}
                    generation={postStore.posts[postIndex]}
                    index={postIndex}
                    markAsRead={markAsRead}
                    markAsUnread={markAsUnread}
                    updateServerTags={updateServerTagWrapper}
                    tagSelectRef={tagSelectRef}
                    setGenerations={postStore.setPosts}
                    generations={postStore.posts}
                    tagList={postStore.tags} />
                <NavigateNextAndPrevious setPostIndex={setPostIndex} postIndex={postIndex} postStore={postStore} tableStore={tableStore} />
                </>
            )}
        </div>
    );
}

function CardWithTags(
    {refer, generation, index, markAsRead, markAsUnread, updateServerTags, tagSelectRef, setGenerations, generations, tagList}:
     {refer: LegacyRef<HTMLDivElement>,generation: ({tags: Tag[]}&Post), index: number, markAsRead: (id: string) => Promise<void>, markAsUnread: (id: string) => Promise<void>, updateServerTags: (id: string, tags: string[]) => Promise<void>, tagSelectRef: React.RefObject<any>, setGenerations: any, generations: ({tags: Tag[]}&Post)[], tagList: Tag[]}) {


    const getBackgroundColor = (read: boolean) => {
        return read ? '#2b1e21' : '#000200';
    }

    const getOptions = (tagList: Tag[]) => {
        return tagList.map(tag => {
            return {
                value: tag.tag,
                label: tag.label,
                color: tag.color
            }
        })
    }
    return (
        <Card ref={refer} key={index} className={`m-2 py-2 w-full`} style={{borderColor: getBorderColor(tagList, generation.tags) ?? 'inherit',
            background: getBackgroundColor(generation.read)
        }}>
            <CardHeader>
                <CardTitle>
                    <CardDescription>
                        <Link href={generation.url ?? ''} className="text-md sm:text-base md:text-lg w-5" target='_blank' title={generation.url ?? ''}>
                            {generation.title}
                        </Link>
                    </CardDescription>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid items-center gap-2 sm:gap-4">
                    <div className="flex flex-col space-y-1 sm:space-y-1.5 w-100">
                        <Markdown 
                            className="tracking-tighter sm:tracking-normal text-xl
                            whitespace-pre-wrap w-100 break-words"
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code(props) {
                                  const {children, className, node,ref,  ...rest} = props
                                  const match = /language-(\w+)/.exec(className || '')
                                  return match ? (
                                    <div className="whitespace-pre-wrap break-words overflow-x-auto">
                                        <SyntaxHighlighter
                                            {...rest}
                                            PreTag="pre"
                                            wrapLongLines
                                            wrapLines
                                            language={match[1]}
                                            style={a11yDark}
                                            className={cn(className)}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code {...rest} className={cn(className, "whitespace-pre-wrap break-words overflow-x-auto")}>
                                    {children}
                                    </code>
                                  )
                                }
                              }}>
                            {decodeURIComponent(escape(atob(generation.content!)))}
                        </Markdown>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between">
                
                <Label htmlFor="framework" className="mb-2 sm:mb-0 flex flex-row items-center sp">
                    Tags:
                    <Select
                        closeMenuOnSelect={false}
                        ref={tagSelectRef}
                        isMulti
                        options={getOptions(tagList)}
                        styles={customStyles as any}
                        isSearchable={false}
                        onChange={(selectedValue) => {
                            updateServerTags(generation.id, selectedValue.map(value => value.value));
                            setGenerations(generations.map(generationItem => {
                                if (generationItem.id === generation.id) {
                                    return {
                                        ...generationItem,
                                        tags: tagList.filter(tag => {
                                            return selectedValue.map(value => value.value).includes(tag.tag);
                                        })
                                    }
                                }
                                return generationItem;
                            }))
                        }}
                        value={mapExistingTags(tagList, generation.tags)}
                    />
                    | {generation.id} | {new Date(generation.date).toLocaleString("en-IN", { timeZone: "IST" })}
                </Label>
                
                {
                    generation.read 
                    ? <Button variant="destructive" onClick={()=>markAsUnread(generation.id)}>Mark unread</Button>
                    : <Button variant="success" onClick={()=>markAsRead(generation.id)}>Mark read</Button>
                }
            </CardFooter>
        </Card>);
}


const findFilteredPreviousIndex = (index: number, posts: Post[]) => {
    for (let i = index - 1; i >= 0; i--) {
        if (!posts[i].read) {
            return i;
        }
    }
    return index - 1;
}

const findFilteredNextIndex = (index: number, posts: Post[]) => {
    for (let i = index + 1; i < posts.length; i++) {
        if (!posts[i].read) {
            return i;
        }
    }
    return index + 1;
}

function NavigateNextAndPrevious({setPostIndex, postIndex, postStore,tableStore}: {setPostIndex: (id: number) => void, postIndex: number, postStore: any, tableStore?: TableStore}) {
    const currentPost = decodeURIComponent(escape(atob(postStore.posts[postIndex].content!)));

    const rTime = readingTime(currentPost);

    const nextPost = useCallback(() => {
        if (postIndex + 1 < postStore.posts.length) {
            setPostIndex(postIndex + 1);
            tableStore?.setFocusedId(postStore.posts[postIndex + 1].id);
        } else {
            setPostIndex(0);
            tableStore?.setFocusedId(postStore.posts[0].id);
        }
    }, [postIndex, postStore]);

    const previousPost = useCallback(() => {
        if (postIndex - 1 >= 0) {
            setPostIndex(postIndex - 1);
            tableStore?.setFocusedId(postStore.posts[postIndex - 1].id);
        } else {
            setPostIndex(postStore.posts.length - 1);
            tableStore?.setFocusedId(postStore.posts[postStore.posts.length - 1].id);
        }
    }, [postIndex, postStore]);

    const nextFilteredPost = useCallback(() => {
        if (postIndex + 1 < postStore.posts.length) {
            const nextIndex = findFilteredNextIndex(postIndex, postStore.posts);
            setPostIndex(nextIndex);
            tableStore?.setFocusedId(postStore.posts[nextIndex].id);
        } else {
            setPostIndex(0);
            tableStore?.setFocusedId(postStore.posts[0].id);
        }
    }, [postIndex, postStore]);

    

    const previousFilteredPost = useCallback(() => {
        if (postIndex - 1 >= 0) {
            const prevIndex = findFilteredPreviousIndex(postIndex, postStore.posts);
            setPostIndex(prevIndex);
            tableStore?.setFocusedId(postStore.posts[prevIndex].id);
        } else {
            setPostIndex(postStore.posts.length - 1);
            tableStore?.setFocusedId(postStore.posts[postStore.posts.length - 1].id);
        }
    }, [postIndex, postStore]);

    const read = postStore.posts.filter((post: Post) => post.read).length;


    useKeyboardShortcut(['ArrowRight'], nextPost);
    useKeyboardShortcut(['ArrowLeft'], previousPost);
    useKeyboardShortcut(['ArrowDown'], nextFilteredPost);
    useKeyboardShortcut(['ArrowUp'], previousFilteredPost);

    return (
        <div className="flex justify-between my-5">
            <div className='flex space-x-2'>
                <Button
                variant="outline"
                className="h-10 w-10 p-0"
                onClick={previousFilteredPost}
                >
                <span className="sr-only">Go to Previous filtered post</span>
                <DoubleArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-10 w-10 p-0"
                    onClick={previousPost}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
            </div>
            <Label htmlFor="framework" className="mb-2 flex flex-row items-center">
                {postIndex + 1} of {postStore.posts.length} ({read} read !) - {rTime.text} - {rTime.words} words
            </Label>
            <div className='flex space-x-2'>
                <Button
                    variant="outline"
                    className="h-10 w-10 p-0"
                    onClick={nextPost}
                >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
                </Button>
                <Button
                variant="outline"
                className="h-10 w-10 p-0"
                onClick={nextFilteredPost}
                >
                <span className="sr-only">Go to Next filtered post</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export {
    getBorderColor
}
