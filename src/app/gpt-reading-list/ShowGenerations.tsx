'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {z} from 'zod';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import Select, { StylesConfig } from 'react-select'
import chroma from "chroma-js";
import React from 'react';
import codeScreenshot from 'remark-code-screenshot'


const DBRecord = z.object({
    id: z.string(),
    url: z.string(),
    data: z.string(),
    date: z.string(),
    read: z.number(),
    tags: z.string()
})

// use light colors as the background is dark
const options = [
    { value: 'explore', label: 'Explore' , color: '#FF5630'},
    { value: 'add2anki', label: 'Add to Anki' , color: '#FFC400'},
  ]

const optionType = z.object({
    value: z.string(),
    label: z.string(),
    color: z.string()
})

const mapExistingTags = (tags: string) => {
    const tagsArray = tags.split(',');
    return options.filter(option => tagsArray.includes(option.value));
}

const getBorderColor = (tags: string) => {
    const tagsArray = tags.split(',');
    const optionsArray = options.filter(option => tagsArray.includes(option.value));

    if (optionsArray.length === 0) {
        return;
    }
    if (optionsArray.length === 1) {
        return optionsArray[0].color;
    }
    const colors = optionsArray.map(option => option.color);
    const mix = chroma.average(colors);
    return mix.css();

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
    getServerGenerations: () => Promise<z.infer<typeof DBRecord>[]>;
    setServerMarkAsRead: (id: string) => Promise<void>;
    setServerMarkAsUnread: (id: string) => Promise<void>;
    updateServerTags: (id: string, tags: string[]) => Promise<void>;
}

export default function ShowGenerations({getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread, updateServerTags}: ServerGenerationsType) {


    const [generations, setGenerations] = useState<z.infer<typeof DBRecord>[]>([]);
    const [loading, setLoading] = useState(true);
    
    const tagSelectRef = React.createRef<any>();

    const getGenerations = async () => {
        const response = await getServerGenerations();
        setGenerations(response);
        setLoading(false);
    }

    const markAsRead = async (id: string) => {
        const response = await setServerMarkAsRead(id);
        getGenerations();
    }

    const markAsUnread = async (id: string) => {
        const response = await setServerMarkAsUnread(id);
        getGenerations();
    }

    

    

    useEffect(() => {
        getGenerations();
    }   , [])

    if (loading) {
        return <h1>Loading...</h1>
    }

    return (
        <div>
            <h1 className="text-2xl">Generations</h1>
            {generations.map((generation, index) => {
                return <CardWithTags 
                    key={index}
                    generation={generation}
                    index={index}
                    markAsRead={markAsRead}
                    markAsUnread={markAsUnread}
                    updateServerTags={updateServerTags}
                    tagSelectRef={tagSelectRef}
                    setGenerations={setGenerations}
                    generations={generations}                            />
            })}
        </div>
    )
}

function CardWithTags(
    {generation, index, markAsRead, markAsUnread, updateServerTags, tagSelectRef, setGenerations, generations}:
     {generation: z.infer<typeof DBRecord>, index: number, markAsRead: (id: string) => Promise<void>, markAsUnread: (id: string) => Promise<void>, updateServerTags: (id: string, tags: string[]) => Promise<void>, tagSelectRef: React.RefObject<any>, setGenerations: any, generations: z.infer<typeof DBRecord>[]}) {


    const getBackgroundColor = (read: number) => {
        return read ? '#140c0c' : 'inherit';
    }
    
    return (<Card key={index} className={`m-2 py-2 w-full`} style={{borderColor: getBorderColor(generation.tags),
        background: getBackgroundColor(generation.read)
    }}>
            <CardHeader>
                <CardTitle>
                    <CardDescription>
                        <Link href={generation.url} className="text-md sm:text-base md:text-lg w-5" target='_blank'>
                            {generation.url}
                        </Link>
                    </CardDescription>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid items-center gap-2 sm:gap-4">
                    <div className="flex flex-col space-y-1 sm:space-y-1.5">
                        <ReactMarkdown 
                            remarkPlugins={[codeScreenshot]}
                            className=" w-full max-w-full
                            overflow-auto leading-tight sm:leading-normal 
                            tracking-tighter sm:tracking-normal whitespace-normal text-xl">
                            {generation.data}
                        </ReactMarkdown>
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
                        options={options}
                        styles={customStyles}
                        isSearchable={false}
                        onChange={(selectedValue) => {
                            updateServerTags(generation.id, selectedValue.map(value => value.value));
                            setGenerations(generations.map(generationItem => {
                                if (generationItem.id === generation.id) {
                                    return {
                                        ...generationItem,
                                        tags: selectedValue.map(value => value.value).join(',')
                                    }
                                }
                                return generationItem;
                            }))
                        }}
                        value={mapExistingTags(generation.tags)}
                    />
                    | {generation.id}
                </Label>
                
                {
                    generation.read 
                    ? <Button variant="destructive" onClick={()=>markAsUnread(generation.id)}>Mark unread</Button>
                    : <Button variant="success" onClick={()=>markAsRead(generation.id)}>Mark read</Button>
                }
            </CardFooter>
        </Card>);
}