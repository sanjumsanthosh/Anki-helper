import chroma from "chroma-js";
import Select, { SingleValue, StylesConfig } from 'react-select'
import { z } from "zod";
import { AdditionalNodeLvlInfoType, MermaidDiag } from "./mermaidDiag";
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface CodeSearchProps {
    selectedNode: string;
    setSelectedNode: React.Dispatch<React.SetStateAction<string>>;
    mermaidDiag: MermaidDiag;
    jsonFile: z.infer<typeof AdditionalNodeLvlInfoType>;
}

const CodeSearch = forwardRef(({ selectedNode, setSelectedNode, mermaidDiag, jsonFile }: CodeSearchProps, ref) => {
    const selectRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      openSelectMenu: () => {
          if (selectRef.current) {
              selectRef.current.focus();
          }
      }
  }));

    const optionType = z.object({
        value: z.string(),
        label: z.string(),
    });

    const getSelectedNode = (selectedNode: string) => {
        return { value: selectedNode, label: selectedNode };
    }

    const allPossibleNodes = () => {
        let allOptions = mermaidDiag.getFullNodeList()
            .filter(node => mermaidDiag.checkIfOverrideAttrExists(node, jsonFile))
            .map(node => {
                return { value: node, label: `${node}⚡` };
            });
        allOptions.sort((a, b) => {
            if (a.label.includes('⚡') && !b.label.includes('⚡')) {
                return -1;
            } else if (!a.label.includes('⚡') && b.label.includes('⚡')) {
                return 1;
            } else {
                return 0;
            }
        });
        return allOptions;
    }
    
    const findOutColor = (node: string) => {
        // if it the current node then return green color
        if (node === mermaidDiag.currentNode) {
            return chroma('#93ff93');
        } else {
            return chroma('grey');
        }
    }

    const customStyles: StylesConfig<z.infer<typeof optionType>, false> = {
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
        singleValue: (styles, { data }) => {
          const color = findOutColor(data.value);
          return {
            ...styles,
            color: color.css(),
          };
        },
      };

    return ( 
        <Select
            ref={selectRef}
            closeMenuOnSelect={true}
            styles={customStyles}
            options={allPossibleNodes()}
            isSearchable={true}
            onChange={(selectedValue : SingleValue<{
                value: string;
                label: string;
            }>) => {
                setSelectedNode(selectedValue ? selectedValue.value : '');
            }}
            value={selectedNode ? getSelectedNode(selectedNode) : null}
        />
    );
});

export default CodeSearch;