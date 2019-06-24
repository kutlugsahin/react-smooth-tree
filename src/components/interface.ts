import { ReactNode } from "react";

/*
An empty array children means the node is leaf
*/
export interface TreeItem {
	title: React.ReactNode;
	children?: TreeItem[];
	id: string;
	draggable?: boolean;
}

export interface TreeNodeItem extends TreeItem {
	level: number;
	item: TreeItem;
	parent?: TreeNodeItem;
}

export enum NodeState {
	Leaf = 0,
	Loading = 1,
	Collapsed = 2,
	Expanded = 4,
}

export interface TreeItemNodeState {
	item: TreeItem;
	isDragging: boolean;
	isDraggedOver: boolean;
	state: NodeState;
	isSelected: boolean;
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
	onSelected: (id: string) => void;
	onToggleExpanded: (id: string) => void;	
	getNodeClassName?: (props: TreeItemNodeState) => string;
	getItemDragData?: (item: TreeItem) => string;
	shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
	onItemDrag: (item: TreeItem) => void;
	dragContext?: DragContext;
	renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
}

export interface TreeKeyProps {
	selectedKey: string;
	expandedKeys: KeySet;
	loadingKeys: KeySet;
}

export interface TreeNodeContextProps extends TreeKeyProps{
	height: number;
	getNodeClassName?: (props: TreeItemNodeState) => string;
	getItemDragData?: (item: TreeItem) => string;
	shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
	dragContext?: DragContext;
	renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
}

export interface TreeKeyChangedProps {
	onSelected: (key: string) => void;
	onExpandedKeysChanged: (keySet: KeySet) => void;
	onLoadingKeysChanged: (keyset: KeySet) => void;
}

export interface TreeProps extends TreeKeyProps, TreeKeyChangedProps {
	items: TreeItem[];
	onItemsChanged: (items: TreeItem[]) => void;
	renderNode?: (node: TreeItem) => React.ReactNode;
	nodeHeight?: number;
	load?: (id: string) => Promise<TreeItem[]>;
	getNodeClassName?: (props: TreeItemNodeState) => string;
	getItemDragData?: (item: TreeItem) => string;
	shouldAllowDrop?: (draggedItem: TreeItem, targetItem: TreeItem, data?: string) => boolean;
	renderNodeIcon?: (state: NodeState, toggleExpand: () => void) => ReactNode;
}

export interface Dictionary<T>{
	[key: string]: T | undefined;
}

export type KeySet = Dictionary<boolean>;