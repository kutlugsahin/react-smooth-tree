import * as React from 'react';
import { createContext, useContext, useState } from "react";
import styles from './tree.module.scss';
import { TreeNodeData } from './Tree';
import classnames from 'classnames';

export interface TreeNodeContext {
	selectedKey: string;
	expandedKeys: Set<string>;
}

const treeNodeContext = createContext<TreeNodeContext>({
	expandedKeys: new Set(),
	selectedKey: '',
});
export const TreeNodeContext = treeNodeContext;


export type NodeRenderer = (props: TreeNodeProps) => React.ReactNode;

export interface TreeNodeProps extends TreeNodeData {
	onSelected: (node: string) => void;
	onExpanded: (node: string) => void;
	height: number;
}

export const TreeNode = ({ isLeaf, id, title, level, onSelected, onExpanded, height, }: TreeNodeProps) => {
	const { expandedKeys, selectedKey }: TreeNodeContext = useContext(TreeNodeContext);
	const [isDraggedOver, setDraggedOver] = useState(false);

	const isExpanded = expandedKeys.has(id);
	const isSelected = selectedKey === id;

	let autoExpandTimer: any;

	React.useEffect(() => {
		if (isDraggedOver && !isExpanded) {
			autoExpandTimer = setTimeout(() => {
				onExpanded(id);
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
		[styles.selected]: selectedKey === id,
		[styles.expanded]: expandedKeys.has(id),
		[styles.draggedOver]: isDraggedOver,
	})

	const icon = isLeaf ? null : <span onClick={() => onExpanded(id)} className={styles.icon}>▶</span>;

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
			onClick={() => onSelected(id)}
			onDoubleClick={() => onExpanded(id)}>
			{icon}
			{title}
		</div>
	);


}