import * as React from 'react';
import { createContext, useContext, useState } from "react";
import styles from './tree.module.scss';
import classnames from 'classnames';
import { TreeKeyProps, TreeNodeItem, TreeNodeContextProps } from "./interface";

const treeNodeContext = createContext<TreeNodeContextProps>({
	expandedKeys: new Set(),
	selectedKey: '',
	loadingKeys: new Set(),
	leafKeys: new Set(),
	height: 30,
});
export const TreeNodeContext = treeNodeContext;


enum TreeNodeState {
	leaf = 0,
	loading = 1,
	collapsed = 2,
	expanded = 4,
}

function getTreeNodeState(id: string, { loadingKeys, leafKeys, expandedKeys }: TreeKeyProps) {
	if (loadingKeys.has(id))
		return TreeNodeState.loading;

	if (leafKeys.has(id))
		return TreeNodeState.leaf;

	if (expandedKeys.has(id))
		return TreeNodeState.expanded;

	return TreeNodeState.collapsed;
}

export const TreeNode = React.memo(({ id, title, level, onSelected, onToggleExpanded, onKeyDown }: TreeNodeItem) => {
	const { height, ...keys }: TreeNodeContextProps = useContext(TreeNodeContext);
	const [isDraggedOver, setDraggedOver] = useState(false);
	const isSelected = id === keys.selectedKey;

	const nodeState = getTreeNodeState(id, keys);

	let autoExpandTimer: any;

	React.useEffect(() => {
		if (isDraggedOver && nodeState !== TreeNodeState.expanded) {
			autoExpandTimer = setTimeout(() => {
				onToggleExpanded(id);
			}, 700);
		}

		return () => {
			clearTimeout(autoExpandTimer);
		}
	}, [isDraggedOver])

	const indentedStyle = {
		paddingLeft: `${level * 20 + 5}px`,
		height: `${height}px`,
	};

	const selectedClass = classnames({
		[styles.node]: true,
		[styles.expanded]: nodeState === TreeNodeState.expanded,
	});

	const titleWrapper = classnames({
		[styles.titleWrapper]: true,
		[styles.draggedOver]: isDraggedOver,
		[styles.selected]: isSelected,
	});

	let icon = null;

	switch (nodeState) {
		case TreeNodeState.collapsed:
			icon = <span onClick={() => onToggleExpanded(id)} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.expanded:
			icon = <span onClick={() => onToggleExpanded(id)} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.leaf:
			icon = <span onClick={() => onToggleExpanded(id)} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.loading:
			icon = <span onClick={() => onToggleExpanded(id)} className={styles.icon}>▶</span>;
			break;
		default:
			break;
	}

	return (
		<div
			draggable
			onDragOver={(e) => {
				e.preventDefault();
				setDraggedOver(true);
			}}
			onDrop={() => setDraggedOver(false)}
			onDragEnd={() => setDraggedOver(false)}
			onDragLeave={() => { setDraggedOver(false) }}
			style={indentedStyle}
			className={selectedClass}
			onKeyDown={e => onKeyDown(id, e)}
		>
			{icon}
			<div className={titleWrapper}
				onClick={() => !isSelected && onSelected(id)}
				onDoubleClick={() => onToggleExpanded(id)}>
				{title}
			</div>
		</div>
	);
});