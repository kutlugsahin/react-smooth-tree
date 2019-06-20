import { TreeItem, TreeNodeItem, TreeProps, TreeNodeItemEvents } from "./interface";

export interface TreeBuilder {
	flatNodes: TreeNodeItem[];
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
		...item,
		level: 0,
		onToggleExpanded,
		onSelected,
		onKeyDown,
	} as TreeNodeItem));

	const stack: TreeNodeItem[] = [...nodes];

	const map: TreeNodeItem[] = [];

	while (stack.length) {
		const current = stack.shift()!;
		map.push(current);
		if (expandedKeys.has(current.id)) {
			if (current.children) {
				for (let i = current.children.length - 1; i >= 0; i--) {
					const child = current.children[i];
					const childNodeItem: TreeNodeItem = {
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


	return {
		flatNodes: map,
	}
}