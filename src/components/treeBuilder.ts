import { TreeItem, TreeNodeItem, TreeProps, TreeNodeItemEvents } from "./interface";

export interface TreeBuilder {
	flatNodes: TreeNodeItem[];
	indexOf: (id: string) => number;
	getNodeById: (id: string) => TreeNodeItem | undefined;
}

export interface TreeBuilderFunction {
	(
		items: TreeItem[],
		events: TreeNodeItemEvents,
		props: TreeProps,
	): TreeBuilder;
}

export const treeBuilder: TreeBuilderFunction = (items: TreeItem[], { onToggleExpanded, onKeyDown, onSelected }: TreeNodeItemEvents, { expandedKeys }: TreeProps): TreeBuilder => {

	const nodes: TreeNodeItem[] = items.map(item => ({
		item,
		...item,
		level: 0,
		onToggleExpanded,
		onSelected,
		onKeyDown,
	} as TreeNodeItem));

	const stack: TreeNodeItem[] = [...nodes];

	const flatNodes: TreeNodeItem[] = [];
	const nodeMap = new Map<string, TreeNodeItem>();
	// const treeItemMap = new Map<string, TreeItem>();

	while (stack.length) {
		const current = stack.shift()!;
		nodeMap.set(current.id, current);
		flatNodes.push(current);
		if (expandedKeys.has(current.id)) {
			if (current.children) {
				for (let i = current.children.length - 1; i >= 0; i--) {
					const child = current.children[i];
					const childNodeItem: TreeNodeItem = {
						item: child,
						...child,
						onToggleExpanded,
						onKeyDown,
						onSelected,
						level: current.level + 1,

					}
					stack.unshift(childNodeItem);
				}
			}
		}
	}

	function indexOf(id: string) {
		return flatNodes.findIndex(p => p.id === id);
	}

	return{
		flatNodes,
		indexOf,
		getNodeById(id: string) {
			return nodeMap.get(id);
		}
	}
}