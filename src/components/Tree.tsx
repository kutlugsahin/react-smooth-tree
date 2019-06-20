import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { TreeNodeContext, TreeNode } from './TreeNode';
import { TreeProps } from './interface';
import { treeBuilder, TreeBuilder } from './treeBuilder';

const Tree = (props: TreeProps) => {
	const [treeStructure, setTreeStructure] = React.useState<TreeBuilder | undefined>(undefined);

	const onNodeToggleExpand = React.useCallback((key: string) => {
		const isExpanded = props.expandedKeys.has(key);
		const newSet = new Set(props.expandedKeys);

		if (isExpanded) {
			newSet.delete(key);
		} else {
			newSet.add(key);
		}
		props.onExpandedKeysChanged(newSet);
	}, [props.expandedKeys, props.onExpandedKeysChanged]);

	const onNodeKeyDown = React.useCallback((id: string, event: React.KeyboardEvent) => {
		switch (event.keyCode) {
			case 8: {
				if (event.shiftKey) {
					// go up
				} else {
					// go down
				}
			}
				break;
			default:
				break;
		}
	}, []);

	const renderNode = React.useCallback(({ index, style }: ListChildComponentProps) => {
		if (treeStructure) {
			const node = treeStructure.flatNodes[index];
			return (
				<div style={style}>
					<TreeNode {...node}
						onToggleExpanded={onNodeToggleExpand}
						onSelected={props.onSelected}
						onKeyDown={onNodeKeyDown}
					/>
				</div>
			);
		}
		return null;
	}, [treeStructure, onNodeToggleExpand, props.onSelected, onNodeKeyDown]);

	React.useEffect(() => {
		setTreeStructure(treeBuilder(props.items, {
			onToggleExpanded: onNodeToggleExpand,
			onKeyDown: onNodeKeyDown,
			onSelected: props.onSelected,
		}, props))
	}, [props.expandedKeys, props.items, onNodeToggleExpand, onNodeKeyDown, props.onSelected])

	if (treeStructure) {
		return (
			<TreeNodeContext.Provider value={{
				expandedKeys: props.expandedKeys,
				selectedKey: props.selectedKey,
				loadingKeys: props.loadingKeys,
				leafKeys: props.leafKeys,
				height: props.nodeHeight || 30
			}}>
				<List
					overscanCount={20}
					height={500}
					itemCount={treeStructure.flatNodes.length}
					itemSize={props.nodeHeight || 30}
					width={'auto'}
					itemKey={(index: number) => treeStructure.flatNodes[index].id}
					children={renderNode}
				/>
			</TreeNodeContext.Provider>
		)
	}

	return null;
}

export default React.memo(Tree);
