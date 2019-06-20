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
	Leaf = 0,
	Loading = 1,
	Collapsed = 2,
	Expanded = 4,
}

function getTreeNodeState(id: string, { loadingKeys, leafKeys, expandedKeys }: TreeKeyProps) {
	if (loadingKeys.has(id))
		return TreeNodeState.Loading;

	if (leafKeys.has(id))
		return TreeNodeState.Leaf;

	if (expandedKeys.has(id))
		return TreeNodeState.Expanded;

	return TreeNodeState.Collapsed;
}

export const TreeNode = React.memo(({ id, title, level, onSelected, onToggleExpanded, onKeyDown }: TreeNodeItem) => {
	const { height, ...keys }: TreeNodeContextProps = useContext(TreeNodeContext);
	const [isDraggedOver, setDraggedOver] = useState(false);
	const isSelected = id === keys.selectedKey;

	const nodeState = getTreeNodeState(id, keys);

	let autoExpandTimer: any;

	React.useEffect(() => {
		if (isDraggedOver && nodeState !== TreeNodeState.Expanded) {
			autoExpandTimer = setTimeout(() => {
				onToggle();
			}, 700);
		}

		return () => {
			clearTimeout(autoExpandTimer);
		}
	}, [isDraggedOver])

	const onToggle = () => {
		if (nodeState & (TreeNodeState.Collapsed | TreeNodeState.Expanded)) {
			onToggleExpanded(id);
		}
	};

	const indentedStyle = {
		paddingLeft: `${level * 20 + 5}px`,
		height: `${height}px`,
	};

	const selectedClass = classnames({
		[styles.node]: true,
		[styles.expanded]: nodeState === TreeNodeState.Expanded,
		[styles.loading]: nodeState === TreeNodeState.Loading
	});

	const titleWrapper = classnames({
		[styles.titleWrapper]: true,
		[styles.draggedOver]: isDraggedOver,
		[styles.selected]: isSelected,
	});

	let icon = null;

	switch (nodeState) {
		case TreeNodeState.Collapsed:
			icon = <span onClick={onToggle} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.Expanded:
			icon = <span onClick={onToggle} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.Leaf:
			icon = <span onClick={onToggle} className={styles.icon}>▶</span>;
			break;
		case TreeNodeState.Loading:
			icon = <span onClick={onToggle} className={styles.icon}>◠</span>;
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
				onDoubleClick={onToggle}>
				{title}
			</div>
		</div>
	);
});