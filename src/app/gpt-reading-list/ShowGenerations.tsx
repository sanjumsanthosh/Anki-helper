'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LegacyRef, useCallback, useEffect, useRef, useState } from 'react';
import {z} from 'zod';
import Markdown from 'react-markdown';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import Select, { StylesConfig } from 'react-select'
import chroma from "chroma-js";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Logger } from '@/lib/logger';
import { toast } from "sonner"
import { Post, Tag } from '@prisma/client';
import remarkGfm from 'remark-gfm'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {a11yDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { usePostStore } from '@/stores/posts';
import { cn } from '@/lib/utils';

const LOGGER_TAG = 'ShowGenerations';

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

export default function ShowGenerations({getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread, updateServerTags, getTagList}: ServerGenerationsType) {

    const postStore = usePostStore((state)=>state);
    const searchParam = useSearchParams();
    const gotoID = searchParam.get('id');
    const [attempts, setAttempts] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [redirectOnce, setRedirectOnce] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [lastScrollTime, setLastScrollTime] = useState(Date.now());
    const toastVisibleUpRef = useRef(false);
    const toastVisibleDownRef = useRef(false);

    const refs = useRef<{ [key: string]: React.RefObject<any> }>({});
    
    const tagSelectRef = React.createRef<any>();

    const getGenerations = async () => {
        if(!postStore.isPostInitialized){
            const response = await getServerGenerations();
            postStore.setPosts(response);
            postStore.setPostInitialized(true);
        }
    }

    const processTagList = async () => {
        if (!postStore.isTagInitialized) {
            const response = await getTagList();
            postStore.setTags(response);
            postStore.setTagInitialized(true);
        }
    }

    const updateServerTagWrapper = async (id: string, tags: string[]) => {
        postStore.updateServerTags(id, tags);
        const response = updateServerTags(id, tags);
    }

    const markAsRead = async (id: string) => {
        postStore.markAsRead(id);
        const response = setServerMarkAsRead(id);
    }

    const markAsUnread = async (id: string) => {
        postStore.markAsUnread(id);
        const response = setServerMarkAsUnread(id);
    }

    
    useEffect(() => {
        postStore.posts.forEach(generation => {
            if (!refs.current[generation.id]) {
                refs.current[generation.id] = React.createRef();
            } 
        });
        if (gotoID && refs.current[gotoID] && refs.current[gotoID].current) {
            if (!redirectOnce) {
                refs.current[gotoID].current.scrollIntoView({behavior: 'smooth'});
                setRedirectOnce(true);
            }
        } else if (gotoID && attempts < 10) {
            // If the ref is not ready and attempts are less than 10, try again after a delay
            setTimer(setTimeout(() => {
                setAttempts(attempts + 1);
            }, 500)); // 500ms delay
        }
    }, [postStore.posts, refs, gotoID, attempts]);

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


        const onScroll = useCallback(() => {
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const currentScrollTime = Date.now();

            const scrollDistance = Math.abs(currentScrollY - lastScrollY);
            const goingUp = currentScrollY < lastScrollY;
            const scrollTime = currentScrollTime - lastScrollTime;

            // Calculate speed in pixels per millisecond
            const scrollSpeed = scrollDistance / scrollTime;

            // If the speed is greater than a certain threshold (e.g., 0.1 pixels/ms), show the toast
            if (scrollSpeed > 9) {
                if (goingUp && !toastVisibleUpRef.current) {
                    toastVisibleUpRef.current = true;
                    toast("You're scrolling fast upwards!", {
                        description: "Move to top?",
                        action: {
                            label: "Move to top",
                            onClick: () => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                toastVisibleUpRef.current = false;
                            }
                        },
                        onAutoClose: () => toastVisibleUpRef.current = false,
                        onDismiss: () => toastVisibleUpRef.current = false
                    });
                } else if (!goingUp && !toastVisibleDownRef.current) {
                    toastVisibleDownRef.current = true;
                    toast("You're scrolling fast downwards!", {
                        description: "Move to bottom?",
                        action: {
                            label: "Move to bottom",
                            onClick: () => {
                                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                                toastVisibleDownRef.current = false;
                            }
                        },
                        onAutoClose: () => toastVisibleDownRef.current = false,
                        onDismiss: () => toastVisibleDownRef.current = false
                    });
                }
            }

            setLastScrollY(currentScrollY);
            setLastScrollTime(currentScrollTime);
        }, [lastScrollY, lastScrollTime]);

        useEffect(() => {
            window.addEventListener("scroll", onScroll, { passive: true });
            return () => {
                window.removeEventListener("scroll", onScroll);
            };
        }, [onScroll]);

    if (postStore.isPostInitialized === false || postStore.isTagInitialized === false) {
        return <h1>Loading...</h1>
    }

    // sort generations by read status
    const sortedGenerations = postStore.posts.sort((a, b) => {
        if (a.read && !b.read) {
            return 1;
        }
        if (!a.read && b.read) {
            return -1;
        }
        return 0;
    });

    return (
        <div>
            <h1 className="text-2xl">Generations</h1>
            {sortedGenerations.map((generation, index) => {
                return <CardWithTags 
                    refer={refs.current[generation.id]}
                    key={index}
                    generation={generation}
                    index={index}
                    markAsRead={markAsRead}
                    markAsUnread={markAsUnread}
                    updateServerTags={updateServerTagWrapper}
                    tagSelectRef={tagSelectRef}
                    setGenerations={postStore.setPosts}
                    generations={postStore.posts}
                    tagList={postStore.tags}                            />
            })}
        </div>
        
    )
}

function CardWithTags(
    {refer, generation, index, markAsRead, markAsUnread, updateServerTags, tagSelectRef, setGenerations, generations, tagList}:
     {refer: LegacyRef<HTMLDivElement>,generation: ({tags: Tag[]}&Post), index: number, markAsRead: (id: string) => Promise<void>, markAsUnread: (id: string) => Promise<void>, updateServerTags: (id: string, tags: string[]) => Promise<void>, tagSelectRef: React.RefObject<any>, setGenerations: any, generations: ({tags: Tag[]}&Post)[], tagList: Tag[]}) {


    const getBackgroundColor = (read: boolean) => {
        return read ? '#824e4e' : '#000200';
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
                                    <SyntaxHighlighter
                                      {...rest}
                                      PreTag="div"
                                      language={match[1]}
                                      style={a11yDark}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code {...rest} className={cn("whitespace-normal overflow-auto", className)}>
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


export {
    getBorderColor
}