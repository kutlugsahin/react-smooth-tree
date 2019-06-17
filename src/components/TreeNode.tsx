import * as React from 'react';
import { createContext, useContext } from "react";
import './tree.css';
import { TreeNodeData } from './Tree';

export interface TreeNodeContext {
	selectedKey: string;
	expandedKeys: Set<string>;
}

const treeNodeContext = createContext<TreeNodeContext>({
	expandedKeys: new Set(),
	selectedKey: '',
});
export const TreeNodeContext = treeNodeContext;

function renderNode(
	title: React.ReactNode,
	isExpanded: boolean,
	isSelected: boolean,
	isLeaf: boolean,
	renderIcon?: () => React.ReactNode,
) {
	if (isLeaf) {
		return (
			<div>
				{title}
			</div>
		);
	}

	if (isExpanded) {
		return (
			<div><b>V</b> {title}</div>
		);
	}

	return (
		<div><b>></b> {title}</div>
	);
}

export interface TreeNodeProps extends TreeNodeData {
	onSelected: (node: string) => void;
	onExpanded: (node: string) => void;
	height: number;
}

export const TreeNode = ({ isLeaf, id: key, title, level, onSelected, onExpanded, height }: TreeNodeProps) => {
	const { expandedKeys, selectedKey }: TreeNodeContext = useContext(TreeNodeContext);

	const indentedStyle = {
		paddingLeft: `${level * 10}px`,
		height: `${height}px`,
	};

	const selectedClass = selectedKey === key ? 'selected' : '';

	return (
		<div
			style={indentedStyle}
			className={selectedClass}
			onClick={() => onSelected(key)}
			onDoubleClick={() => onExpanded(key)}>
			{renderNode(
				title,
				expandedKeys.has(key),
				selectedKey === key,
				false,
			)}
		</div>
	);


}