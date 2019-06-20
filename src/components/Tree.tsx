import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps, FixedSizeList } from 'react-window';
import { TreeNodeContext, TreeNode } from './TreeNode';
import { TreeProps } from './interface';
import { treeBuilder, TreeBuilder } from './treeBuilder';

const Tree = React.forwardRef((props: TreeProps, ref) => {
	const [treeStructure, setTreeStructure] = React.useState<TreeBuilder | undefined>(undefined);
	const listRef: React.MutableRefObject<FixedSizeList | undefined> = React.useRef<FixedSizeList | undefined>();

	const onNodeToggleExpand = React.useCallback((key: string) => {
		const isExpanded = props.expandedKeys.has(key);
		const newSet = new Set(props.expandedKeys);

		if (isExpanded) {
			newSet.delete(key);
		} else {
			newSet.add(key);
		}
		props.onExpandedKeysChanged(newSet);
	}, [props.expandedKeys, props.onExpandedKeysChanged, treeStructure]);

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
	}, [props.expandedKeys, props.items, onNodeToggleExpand, onNodeKeyDown, props.onSelected]);

	React.useImperativeHandle(ref, () => ({
		scrollTo: (id: string) => {
			if (listRef.current && treeStructure) {
				listRef.current.scrollToItem(treeStructure.indexOf(id))
			}
		},
	}), [treeStructure]);

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
					ref={listRef as any}
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
})

export default React.memo(Tree);
