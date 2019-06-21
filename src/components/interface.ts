export interface TreeItem {
	title: React.ReactNode;
	children?: TreeItem[];
	id: string;
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

export interface TreeNodeProps extends TreeNodeItem {
	nodeState: NodeState;
	isSelected: boolean;
	height: number;
	onRequestLoad: (id: string) => void;
	onSelected: (id: string) => void;
	onToggleExpanded: (id: string) => void;	
}

export interface TreeKeyProps {
	selectedKey: string;
	expandedKeys: Set<string>;
	loadingKeys: Set<string>;
}

export interface TreeNodeContextProps extends TreeKeyProps{
	height: number;
}

export interface TreeKeyChangedProps {
	onSelected: (key: string) => void;
	onExpandedKeysChanged: (keySet: Set<string>) => void;
	onLoadingKeysChanged: (keyset: Set<string>) => void;
}

export interface TreeProps extends TreeKeyProps, TreeKeyChangedProps {
	items: TreeItem[];
	onItemsChanged: (items: TreeItem[]) => void;
	renderIcon?: (toggleExpand: () => void) => React.ReactNode;
	renderNode?: (node: TreeItem) => React.ReactNode;
	nodeHeight?: number;
	load?: (id: string) => Promise<TreeItem[]>;
}