import chroma from "chroma-js";
import Select, { MultiValue, StylesConfig } from 'react-select'
import { z } from "zod";
import { AdditionalNodeLvlInfoType, MermaidDiag } from "./mermaidDiag";

interface BadgeBoxProps {
    selectedNodeList: string[];
    setSelectedNodeList: (nodeList: string[]) => void;
    mermaidDiag: MermaidDiag;
    jsonFile: z.infer<typeof AdditionalNodeLvlInfoType>;
}

const BadgeBox = ({ selectedNodeList, setSelectedNodeList, mermaidDiag, jsonFile }: BadgeBoxProps) => {

    const optionType = z.object({
        value: z.string(),
        label: z.string(),
    });

    const getAllSelectedNodes = (selectedNodeList: string[]) => {
        return selectedNodeList.map(node => {
            return { value: node, label: node }
        });
    }

    const allPossibleNodes = (selectedNodeList: string[]) => {
        let allOptions =  mermaidDiag.getFullNodeList().map(node => {
            return { value: node, label: mermaidDiag.checkIfOverrideAttrExists(node, jsonFile) ? `${node}⚡` : node }
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
            closeMenuOnSelect={true}
            isMulti
            styles={customStyles}
            options={allPossibleNodes(selectedNodeList)}
            isSearchable={true}
            onChange={(selectedValue : MultiValue<{
                value: string;
                label: string;
            }>) => {
                setSelectedNodeList(selectedValue.map((node: { value: string }) => node.value));
            }}
            value={getAllSelectedNodes(selectedNodeList).map(node => ({
              ...node,
              label: mermaidDiag.checkIfOverrideAttrExists(node.value, jsonFile) ? `${node.label}⚡` : node.label,
            }))}
        />
    );
}


export default BadgeBox;