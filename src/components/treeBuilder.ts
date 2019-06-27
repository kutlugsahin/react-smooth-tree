import { Dictionary, KeySet, TreeBuilder, TreeBuilderFunction, TreeItem, TreeNodeItem } from './interface';

export const treeBuilder: TreeBuilderFunction = (items: TreeItem[], expandedKeys: KeySet): TreeBuilder => {

    const nodes: TreeNodeItem[] = items.map(item => ({
        ...item,
        item,
        level: 0,
    } as TreeNodeItem));

    const stack: TreeNodeItem[] = [...nodes];
    const flatNodes: TreeNodeItem[] = [];
    const nodeMap: Dictionary<TreeNodeItem> = {};

    while (stack.length) {
        const current = stack.shift()!;
        nodeMap[current.id] = current;
        flatNodes.push(current);
        if (expandedKeys[current.id]) {
            if (current.children) {
                for (let i = current.children.length - 1; i >= 0; i--) {
                    const child = current.children[i];
                    const childNodeItem: TreeNodeItem = {
                        item: child,
                        ...child,
                        level: current.level + 1,
                        parent: current,
                    };
                    stack.unshift(childNodeItem);
                }
            }
        }
    }

    function indexOf(id: string): number {
        return flatNodes.findIndex(p => p.id === id);
    }

    return {
        flatNodes,
        indexOf,
        getNodeById(id: string): TreeNodeItem | undefined {
            return nodeMap[id];
        },
        getNextNode(id: string): TreeNodeItem | undefined {
            const index = indexOf(id);
            return index > -1 ? flatNodes[Math.min(index + 1, flatNodes.length - 1)] : undefined;
        },
        getParentNode(id: string): TreeNodeItem | undefined {
            const node = this.getNodeById(id);
            return node ? node.parent : undefined;
        },
        getPreviousNode(id: string): TreeNodeItem | undefined {
            const index = indexOf(id);
            return index > -1 ? flatNodes[Math.max(index - 1, 0)] : undefined;
        },
    };
};
