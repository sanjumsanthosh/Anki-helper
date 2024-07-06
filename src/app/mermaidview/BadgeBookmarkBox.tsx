import chroma from "chroma-js";
import Select, { MultiValue, StylesConfig } from 'react-select'
import { z } from "zod";

interface BadgeBookmarkBoxProps {
    bookmarks: string[];
    toggleBookmark: (node: string) => void;
}

const BadgeBookmarkBox = ({ bookmarks, toggleBookmark }: BadgeBookmarkBoxProps) => {

    const optionType = z.object({
        value: z.string(),
        label: z.string(),
    });

    const getAllBookmarkNodes = (bookmarks: string[]) => {
        return bookmarks.map(node => {
            return { value: node, label: node }
        });
    }

    const findOutColor = (node: string) => {
        return chroma('#ff8040');
    }

    const bookmarkRemove = (selectedValue: MultiValue<{ value: string; label: string; }>) => {
        const selectedNodes = selectedValue.map((node) => node.value);
        const difference = bookmarks.filter((node) => !selectedNodes.includes(node));
        difference.forEach((node) => toggleBookmark(node));
    }


    const customStyles: StylesConfig<z.infer<typeof optionType>, true> = {
        control: (styles) => ({ ...styles, backgroundColor: 'transparent',border: 'none', color: '#FFFFFF'}),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = findOutColor(data.value);
          return {
            ...styles,
            backgroundColor: isDisabled
              ? undefined
              : isFocused
              ? color.alpha(0.1).css()
              : undefined,
            cursor: isDisabled ? 'not-allowed' : 'default',
          };
        },
        multiValue: (styles, { data }) => {
          const color = findOutColor(data.value);
          return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
          };
        },
        multiValueLabel: (styles, { data }) => ({
          ...styles,
          color: findOutColor(data.value).css(),
        }),
        multiValueRemove: (styles, { data }) => ({
          ...styles,
          color: findOutColor(data.value).css(),
          ':hover': {
            backgroundColor: findOutColor(data.value).alpha(0.1).css(),
            color: 'white',
          },
        }),
      };


    return ( 
        <Select
            isMulti
            styles={customStyles}
            isSearchable={false}
            isClearable={false}
            menuIsOpen={false}
            placeholder="List of bookmarks..."
            onChange={(selectedValue) => {
                bookmarkRemove(selectedValue);
            }}
            value={getAllBookmarkNodes(bookmarks)}
        />
    );
}


export default BadgeBookmarkBox;