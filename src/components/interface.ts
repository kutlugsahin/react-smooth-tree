import { ReactNode } from 'react';

/*
An empty array children means the node is leaf
*/
export interface TreeItem {
    data: any;
    children?: TreeItem[];
    id: string;
}

export interface TreeNodeItem extends TreeItem {
    level: number;
    item: TreeItem;
    parent?: TreeNodeItem;
}

export enum NodeState {
    LEAF = 0,
    LOADING = 1,
    COLLAPSED = 2,
    EXPANDED = 4,
}

export interface TreeItemNodeState {
    item: TreeItem;
    isDragging: boolean;
    isDraggedOver: boolean;
    state: NodeState;
    isSelected: boolean;
}
export interface NodeRendererProps extends TreeItemNodeState {
    onToggleExpand: () => void;
    onSelected: (event: InputEvent) => void;
    nodeIcon?: ReactNode;
    draggableProps?: any;
}

export interface DragContext {
    item: TreeItem;
    data?: string;
}

export interface TreeNodeProps extends TreeNodeItem {
    nodeState: NodeState;
    isSelected: boolean;
    height: number;
    onRequestLoad: (id: string) => void;
    onSelected: (id: string, event: InputEvent) => void;
    onToggleExpanded: (id: string) => void;
    getNodeClassName?: (props: TreeItemNodeState) => string;
    getItemDragData?: (item: TreeItem) => string;
    shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
    onItemDrag: (item: TreeItem) => void;
    dragContext?: DragContext;
    renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
    renderNode?: (props: NodeRendererProps) => React.ReactNode;
    title: ReactNode;
	isDraggable: boolean;
}

export interface TreeKeyProps {
    selectedKey: string | null | undefined;
    expandedKeys: KeySet;
    loadingKeys: KeySet;
}

export interface TreeNodeContextProps extends TreeKeyProps {
    height: number;
    getNodeClassName?: (props: TreeItemNodeState) => string;
    getItemDragData?: (item: TreeItem) => string;
    shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
    dragContext?: DragContext;
    renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
	renderNode?: (props: NodeRendererProps) => React.ReactNode;
}

export enum InputType {
    MOUSE,
    KEYBOARD,
    POINTER,
    TOUCH,
}

export type InputEvent = MouseEvent | TouchEvent | PointerEvent;

export interface TreeKeyChangedProps {
    onSelected: (key: string, event: InputType) => void;
    onExpandedKeysChanged: (keySet: KeySet) => void;
    onLoadingKeysChanged: (keyset: KeySet) => void;
}

export interface TreeProps extends TreeKeyProps, TreeKeyChangedProps {
    items: TreeItem[];
    onItemsChanged?: (items: TreeItem[]) => void;
    renderNode?: (props: NodeRendererProps) => React.ReactNode;
    nodeHeight?: number;
    load?: (id: string) => Promise<TreeItem[]>;
    getNodeClassName?: (props: TreeItemNodeState) => string;
    getItemDragData?: (item: TreeItem) => string;
    shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
    renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
    renderTitle: (data: any) => ReactNode;
    height?: number;
}

export interface Dictionary<T> {
    [key: string]: T | undefined;
}

export type KeySet = Dictionary<boolean>;

export interface TreeBuilder {
    flatNodes: TreeNodeItem[];
    indexOf: (id: string) => number;
    getNodeById: (id: string) => TreeNodeItem | undefined;
    getNextNode: (id: string) => TreeNodeItem | undefined;
    getPreviousNode: (id: string) => TreeNodeItem | undefined;
    getParentNode: (id: string) => TreeNodeItem | undefined;
}

export type TreeBuilderFunction = (items: TreeItem[], expandedKeys: KeySet) => TreeBuilder;
