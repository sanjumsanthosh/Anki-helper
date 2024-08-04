import { Logger } from "@/lib/logger";
import { Graph, Subgraph } from "dotparser";
import { JsonProperty, Serializable, deserialize, serialize, SerializableEntity } from 'ts-jackson';
import { z } from "zod";


@Serializable()
class MermaidNode {
    

    @JsonProperty()
    name: string

    @JsonProperty()
    parentId: string

    @JsonProperty()
    attr: Record<string, string> = {}

    isSelfLoop: boolean = false;

    constructor(name: string, parentId: string) {
        this.name = name;
        this.parentId = parentId;
    }

    setAttr(arg0: any, arg1: any) {
        this.attr[arg0] = arg1;
    }

    static getUniqueId(node: MermaidNode) {
        return Buffer.from(node.name).toString('base64');
    }
}

@Serializable()
class MermaidEdge {

    @JsonProperty()
    from: MermaidNode

    @JsonProperty()
    to: MermaidNode
    constructor(from: MermaidNode, to: MermaidNode) {
        this.from = from
        this.to = to
    }

    static getUniqueId(from: MermaidNode, to: MermaidNode){
        return Buffer.from(from.name).toString('base64') + ":" + Buffer.from(to.name).toString('base64');
    }
}



@Serializable()
class MermaidGraph {

    @JsonProperty()
    graphAttr: Record<string, string> = {};

    @JsonProperty()
    id: string;

    @JsonProperty()
    subGraphs: MermaidGraph[] = [];

    @JsonProperty()
    nodes: MermaidNode[] = [];

    @JsonProperty()
    edges: MermaidEdge[] = [];

    @JsonProperty()
    depth: number;

    @JsonProperty()
    parent: string;

    constructor(depth: number = 0, parent: MermaidGraph|null) {
        this.depth = depth;
        this.id = MermaidGraph.getUniqueId(this);
        if (!parent) {
            if (depth === 0) {
                this.parent = MermaidGraph.getUniqueId(this);
            } else {
                throw new Error("Parent is null but depth is not 0");
            }
        } else {
            this.parent = MermaidGraph.getUniqueId(parent);
        }
    }

    addNode(node: MermaidNode) {
        this.nodes.push(node);
    }

    addAttr(key: string, value: string) {
        this.graphAttr[key] = value;
    }

    addSubGraph(graph: MermaidGraph) {
        this.subGraphs.push(graph);
    }

    static getUniqueId(graph: MermaidGraph) {
        return Buffer.from(graph.depth.toString()).toString('base64');
    }


    toString() {
        return JSON.stringify({
            graphAttr: this.graphAttr,
            num_nodes: this.nodes.length,
            num_edges: this.edges.length,
            depth: this.depth
        });
    }
}


@Serializable()
class MermaidDiag {

    @JsonProperty()
    mermaidGraph: MermaidGraph;

    isInitialized: boolean = false;

    mermaidGraphList: { [key: string]: MermaidGraph } = {};
    mermaidNodeList: { [key: string]: MermaidNode } = {};
    mermaidEdgeList: { [key: string]: MermaidEdge } = {};
    mermaidEdgeFromMap: { [key: string]: string[] } = {};
    mermaidEdgeToMap: { [key: string]: string[] } = {};


    additionalNodeLvlInfo: z.infer<typeof AdditionalNodeLvlInfoType> = {};

    currentNode: string = '';

    constructor() {
        this.mermaidGraph = new MermaidGraph(0, null);
        this.mermaidGraphList[MermaidGraph.getUniqueId(this.mermaidGraph)] = this.mermaidGraph;
    }

    parseGraph(graphData: Graph[]) {
        const firstGraph = graphData[0];
        this.mermaidGraph = this.parseGraphRecursive(firstGraph, this.mermaidGraph);

        return this.mermaidGraph;
    }

    updateEdgeMaps(EdgeId: string) {
        const decode = EdgeId.split(":");
        const from = decode[0];
        const to = decode[1];
        if (!this.mermaidEdgeFromMap[from]) {
            this.mermaidEdgeFromMap[from] = [];
            this.mermaidEdgeFromMap[from].push(to);
        } else {
            this.mermaidEdgeFromMap[from].push(to);
        }

        if (!this.mermaidEdgeToMap[to]) {
            this.mermaidEdgeToMap[to] = [];
            this.mermaidEdgeToMap[to].push(from);
        } else {
            this.mermaidEdgeToMap[to].push(from);
        }
    }

    getOrCreateNode(name: string, parentId: string, attr_list: any[] = []): MermaidNode {
        let existingNode = this.mermaidGraph.nodes.find(node => node.name === name);
        if (!existingNode) {
            const newNode = new MermaidNode(name, parentId);
            const nodeId = MermaidNode.getUniqueId(newNode);
            this.mermaidGraph.addNode(newNode);
            this.mermaidNodeList[nodeId] = newNode;
            existingNode = newNode;
        }

        attr_list.forEach(attr => {
            existingNode.setAttr(attr.id.toString(), attr.eq.toString());
        });

        return existingNode;
    }
    
    parseGraphRecursive(graph: Graph|Subgraph, parent: MermaidGraph): MermaidGraph {
    
        // Base case: If the graph has no children, return the parent to stop recursion
        if (!graph.children || graph.children.length === 0) {
            return parent;
        }
    
        graph.children.forEach(child => {
            if (child.type === "attr_stmt") {
                child.attr_list.forEach(attr => {
                    parent.addAttr(attr.id.toString(), attr.eq.toString());
                });
            } else if (child.type === "subgraph") {
                const subgraph = new MermaidGraph(parent.depth + 1, parent);
                this.mermaidGraphList[MermaidGraph.getUniqueId(subgraph)] = subgraph;
                parent.addSubGraph(this.parseGraphRecursive(child, subgraph));
            } else if (child.type === "node_stmt") {
                parent.addNode(this.getOrCreateNode(child.node_id.id.toString(), parent.id, child.attr_list));
            } else if (child.type === "edge_stmt") {
                const from = child.edge_list[0]?.id ? this.getOrCreateNode(child.edge_list[0].id.toString(), parent.id) : null;
                const to = child.edge_list[1]?.id ? this.getOrCreateNode(child.edge_list[1].id.toString(), parent.id) : null;

                if (from && to) {
                    const edge = new MermaidEdge(from, to);
                    const edgeId = MermaidEdge.getUniqueId(from, to);
                    this.mermaidGraphList[to.parentId].edges.push(edge);
                    this.updateEdgeMaps(edgeId);
                    this.mermaidEdgeList[edgeId] = edge;

                } else {
                    Logger.error("Edge is missing from or to node", child);
                }
                
            } else {
                Logger.error("Unhandled child type", child);
            }
        });
    
        return parent;
    }

    populateGraphListsRecursive(graph: MermaidGraph) {
        this.mermaidGraphList[MermaidGraph.getUniqueId(graph)] = graph;
        graph.nodes.forEach(node => {
            const nodeId = MermaidNode.getUniqueId(node);
            this.mermaidNodeList[nodeId] = node;
        });
        graph.edges.forEach(edge => {
            const edgeId = MermaidEdge.getUniqueId(edge.from, edge.to);
            this.updateEdgeMaps(edgeId);
            this.mermaidEdgeList[edgeId] = edge;
        });
        graph.subGraphs.forEach(subGraph => {
            this.populateGraphListsRecursive(subGraph);
        });
    }


    repopulateGraphLists() {
        this.mermaidGraphList = {};
        this.mermaidNodeList = {};
        this.mermaidEdgeList = {};
        this.mermaidEdgeFromMap = {};
        this.mermaidEdgeToMap = {};
        this.populateGraphListsRecursive(this.mermaidGraph);
    }

    

    getNodeList(currentNodePath: string[] = []) : string[] {
        this.repopulateGraphLists();
        if (currentNodePath.length === 0){
            return [];
        } else {
            const currentNode = this.mermaidNodeList[Buffer.from(currentNodePath[currentNodePath.length - 1]).toString('base64')];
            const toNodes = this.mermaidEdgeFromMap[MermaidNode.getUniqueId(currentNode)];
            if (toNodes) {
                let toNodesNames =  toNodes.map(edge => {
                    const edgeObj = this.mermaidNodeList[edge];
                    return edgeObj.name;
                });
                if(toNodesNames.includes(currentNode.name)){
                    const getTheNode = this.mermaidNodeList[Buffer.from(toNodesNames[0]).toString('base64')];
                    getTheNode.isSelfLoop = true;
                    toNodesNames = toNodesNames.filter(node => !currentNodePath.includes(node));
                }
                return toNodesNames;
            } else {
                return [];
            }
        }
    }

    render(currentNodePath: string[] = [], currentNode?: string, jsonFile: z.infer<typeof AdditionalNodeLvlInfoType> = {}) {
        this.repopulateGraphLists();

        const mermaidFlowBuilder = new MermaidFlowBuilder(currentNode);
        mermaidFlowBuilder.addHeader(); 
        mermaidFlowBuilder.indent();

        let edgeToList: number[] = [];
        let edgeForList: number[] = [];

        // if currentNodePath is emtpy 
        if (currentNodePath.length === 0) {
            currentNodePath = this.getNodeList([]);
        }

        for(let i = 0; i < currentNodePath.length; i++) {
            const node = currentNodePath[i];
            const toNodes = this.mermaidEdgeFromMap[Buffer.from(node).toString('base64')] as string[] | undefined;
            

            if (toNodes) {
                for (const edge of toNodes) {
                    const edgeObj = this.mermaidNodeList[edge];
                    if (node === currentNode) {
                        const isGold = (jsonFile[node] && jsonFile[node].description !== undefined);
                        mermaidFlowBuilder.addNodeIfNotExists(edgeObj.name, "toNodes", isGold);
                        edgeToList.push(mermaidFlowBuilder.addEdge(node, edgeObj.name));
                    } else {
                        mermaidFlowBuilder.addNodeIfNotExists(edgeObj.name);
                        mermaidFlowBuilder.addEdge(node, edgeObj.name);
                    }
                    
                    
                    if (edgeObj.isSelfLoop){
                        mermaidFlowBuilder.addEdge(edgeObj.name, edgeObj.name);
                    }
                }
            }

            const fromNodes = this.mermaidEdgeToMap[Buffer.from(node).toString('base64')] as string[] | undefined;

            if (fromNodes) {
                for (const edge of fromNodes) {
                    const edgeObj = this.mermaidNodeList[edge];
                    if (node === currentNode) {
                        const isGold = (jsonFile[node] && jsonFile[node].description !== undefined);
                        mermaidFlowBuilder.addNodeIfNotExists(edgeObj.name, "fromNodes", isGold);
                        edgeForList.push(mermaidFlowBuilder.addEdge(edgeObj.name, node));
                    } else {
                        mermaidFlowBuilder.addNodeIfNotExists(edgeObj.name);
                        mermaidFlowBuilder.addEdge(edgeObj.name, node);
                    }
                    
                }
            }

            const isGold = (jsonFile[node] && jsonFile[node].description !== undefined);
            mermaidFlowBuilder.addNodeIfNotExists(node, "selectedNodes",isGold);
                
        }

        mermaidFlowBuilder.detent();
        mermaidFlowBuilder.addClassDef("currentNode", "fill:#00ff40,stroke-width:2px;");
        mermaidFlowBuilder.addClassDef("currentNodeGold", "fill:#00ff40,stroke-width:2px,stroke:#fcbf6d");
        mermaidFlowBuilder.addClassDef("selectedNodes", "fill:#93ff93,stroke-width:2px;stroke-dasharray: 5 5");
        mermaidFlowBuilder.addClassDef("selectedNodesGold", "fill:#93ff93,stroke-width:2px,stroke-dasharray: 5 5,stroke:#fcbf6d");
        mermaidFlowBuilder.addClassDef("toNodes", "fill:#ffffae,stroke-width:2px;stroke-dasharray: 5 5");
        mermaidFlowBuilder.addClassDef("toNodesGold", "fill:#ffffae,stroke-width:2px,stroke-dasharray: 5 5,stroke:#fcbf6d");
        mermaidFlowBuilder.addClassDef("fromNodes", "fill:#ffaeae,stroke-width:2px;stroke-dasharray: 5 5");
        mermaidFlowBuilder.addClassDef("fromNodesGold", "fill:#ffaeae,stroke-width:2px,stroke-dasharray: 5 5,stroke:#fcbf6d");

        // linkStyle 0 stroke-width:2px,fill:none,stroke:blue;
        for (let edge of edgeToList) {
            mermaidFlowBuilder.addLinkStyle(edge, "stroke-width:2px,fill:none,stroke:#ffff28");
        } 

        for (let edge of edgeForList) {
            mermaidFlowBuilder.addLinkStyle(edge, "stroke-width:2px,fill:none,stroke:#ff5353");
        }


        return mermaidFlowBuilder.toString();
    }

    getToNodesOfParent(currentNode: string): string[] {
        const toNodes = this.mermaidEdgeFromMap[Buffer.from(currentNode).toString('base64')];
        if (toNodes) {
            return toNodes.map(edge => {
                const edgeObj = this.mermaidNodeList[edge];
                return edgeObj.name;
            });
        } else {
            return [];
        }
    }

    getFromNodesOfParent(currentNode: string): string[] {
        const fromNodes = this.mermaidEdgeToMap[Buffer.from(currentNode).toString('base64')];
        if (fromNodes) {
            return fromNodes.map(edge => {
                const edgeObj = this.mermaidNodeList[edge];
                return edgeObj.name;
            });
        } else {
            return [];
        }
    }

    getFullNodeList(): string[] {
        return this.mermaidGraph.nodes.map(node => node.name);
    }

    setCurrentNode(currentNode: string) {
        this.currentNode = currentNode;
    }


    getAttrOfNode(currentNode: string, settings: z.infer<typeof AdditionalNodeLvlInfoType>) {
        if (!currentNode) {
            return {}
        }
        const node = this.mermaidNodeList[Buffer.from(currentNode).toString('base64')];
        const overrideAttr = settings[currentNode];
        const attr = tryParseAttrs(node.attr, settings);
        if (overrideAttr) {
            return {
                ...attr,
                ...overrideAttr
            }
        }
        return attr;
    }

    checkIfOverrideAttrExists(currentNode: string, settings: z.infer<typeof AdditionalNodeLvlInfoType>) {
        return settings[currentNode] ? true : false;
    }

    updateOrCreateOverrideAttr(value: z.infer<typeof NodeAttrType>) {
        if (!this.additionalNodeLvlInfo[this.currentNode]) {
            this.additionalNodeLvlInfo[this.currentNode] = {};
        }
        this.additionalNodeLvlInfo[this.currentNode] = value;
    }

    parseOverrideAttr(value: any) {
        this.additionalNodeLvlInfo = value;
    }

    getOverrideJSON() {
        return this.additionalNodeLvlInfo;
    }

    serialize(){
        return serialize(this);
    }

    static deserialize(serialized: Record<string, unknown>)
    {
        return deserialize(serialized, MermaidDiag);
    }
}

class MermaidFlowBuilder {
    
    private output: string = "";
    private indentLevel: number = 0;
    private currentNode: string|undefined;
    private edgeNo: number = -1;

    constructor(currentNode?: string) {
        this.currentNode = currentNode;
    }

    addHeader() {
        this.output += "flowchart TD\n";
    }

    indent() {
        this.indentLevel += 1;
    }

    detent() {
        this.indentLevel -= 1;
    }

    addToOutput(text: string) {
        this.output += " ".repeat(this.indentLevel * 4) + text + "\n";
    }

    addNodeIfNotExists(node: string, className?: string, isGold?: boolean) {
        if (this.currentNode && node === this.currentNode) {
            this.addToOutput(`${node}:::currentNode` + (isGold ? "Gold" : ""));
        } else {
            this.addToOutput(`${node}${className ? `:::${className}` : ""}`);
        }
    }

    addEdge(from: string, to: string) {
        this.edgeNo += 1;
        this.addToOutput(`${from} --> ${to}`);
        return this.edgeNo;
    }

    addClassDef(className: string, style: string) {
        this.addToOutput(`classDef ${className} ${style}`);
    }

    addLinkStyle(edge: number, arg1: string) {
        this.addToOutput(`linkStyle ${edge} ${arg1}`);
    }

    toString() {
        return this.output;
    }
}

const functionInputs = z.object({
    type: z.string().optional(),
    description: z.string().optional(),
    default: z.string().optional()
})

const NodeAttrType = z.object({
    label : z.string().optional(),
    systemPath : z.string().optional(),
    relativePath : z.string().optional(),
    lineNo: z.string().optional(),
    endLineNo: z.string().optional(),
    emgithubIframeLink: z.string().optional(),
    functionInputs: z.array(functionInputs).default([]).describe("Function Inputs with type, description and optional default value as json string").optional(),
    functionOutputs: z.array(functionInputs).default([]).describe("Function Outputs with type, description and optional default value as json string").optional(),
    description: z.string().optional(),
})


const ConfigurationMap = z.object({
    GIT_URL: z.string().optional(),
});

// const AdditionalNodeLvlInfo = { [key: string]: z.infer<typeof NodeAttrType> } & { ANKIConfig?: z.infer<typeof ConfigurationMap> }
const AdditionalNodeLvlInfoType = z.object({
    ANKIConfig: ConfigurationMap.optional()
}).and(z.record(NodeAttrType));

// const AdditionalNodeLvlInfoType = z.record(NodeAttrType);


function tryParseAttrs(attr: Record<string, string>, settings: z.infer<typeof AdditionalNodeLvlInfoType>): z.infer<typeof NodeAttrType> {
    try {
        let record = attr['label'];
        let splitLable = record.split("\\n");
        let systemPath = splitLable[1];
        let relativePath = undefined;
        let lineNo = undefined;
        let emgithubIframeLink = undefined;
        if (systemPath) {
            systemPath = systemPath.replace("(", "").replace(")", "");
            relativePath = systemPath.split("\\").slice(1).join("/");
            let splitPath = relativePath.split(":");
            relativePath = splitPath[0]; // piku.py
            lineNo = splitPath[1]; // 1280

            if (relativePath && lineNo) {
                emgithubIframeLink = buildEMGithubIframeLink(relativePath, lineNo, settings.ANKIConfig?.GIT_URL);
            }
        }

        return {
            label: splitLable[0],
            systemPath: systemPath ? systemPath.replace("(", "").replace(")", "") : "Not Found",
            relativePath: relativePath,
            lineNo: lineNo,
            emgithubIframeLink: emgithubIframeLink,
        }
    } catch (e) {
        Logger.error("Error parsing node attributes", e);
        return {}
    }
}



function buildEMGithubIframeLink(relativePath: string, lineNo: string, GIT_URL?: string) {
    let totalNo = 50 + parseInt(lineNo);
    const githubLink = "https://emgithub.com/iframe.html?";
    relativePath = `${GIT_URL}${relativePath}`;
    const target = `target=${encodeURIComponent(relativePath + `#L${lineNo}-L${totalNo}`)}`;
    const style = "style=default";
    const type = "type=code";
    const showBorder = "showBorder=on";
    const showLineNumbers = "showLineNumbers=on";
    const showFileMeta = "showFileMeta=on";
    const showFullPath = "showFullPath=on";
    const showCopy = "showCopy=on";
    return `${githubLink}${target}&${style}&${type}&${showBorder}&${showLineNumbers}&${showFileMeta}&${showFullPath}&${showCopy}`;
}


export {
    MermaidDiag,
    MermaidGraph,
    MermaidNode,
    MermaidEdge,
    NodeAttrType,
    AdditionalNodeLvlInfoType,
    ConfigurationMap
}