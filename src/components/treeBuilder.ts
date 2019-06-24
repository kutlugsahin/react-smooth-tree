import { TreeItem, TreeNodeItem, TreeProps } from "./interface";

export interface TreeBuilder {
	flatNodes: TreeNodeItem[];
	indexOf: (id: string) => number;
	getNodeById: (id: string) => TreeNodeItem | undefined;
	getNextNode: (id: string) => TreeNodeItem | undefined;
	getPreviousNode: (id: string) => TreeNodeItem | undefined;
	getParentNode: (id: string) => TreeNodeItem | undefined;
}

export interface TreeBuilderFunction {
	(
		items: TreeItem[],
		expandedKeys: Set<string>,
	): TreeBuilder;
}

export const treeBuilder: TreeBuilderFunction = (items: TreeItem[], expandedKeys: Set<string>): TreeBuilder => {

	const nodes: TreeNodeItem[] = items.map(item => ({
		item,
		...item,
		level: 0,
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
						level: current.level + 1,
						parent: current,
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
		},
		getNextNode(id: string) {
			const index = indexOf(id);
			return index > -1 ? flatNodes[Math.min(index + 1, flatNodes.length - 1)] : undefined;
		},
		getParentNode(id: string) {
			const node = this.getNodeById(id);
			return node ? node.parent : undefined;
		},
		getPreviousNode(id: string) {
			const index = indexOf(id);
			return index > -1 ? flatNodes[Math.max(index - 1, 0)] : undefined;
		}
	}
}