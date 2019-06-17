import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import './tree.css';
import { TreeNode, TreeNodeContext } from './TreeNode';
export interface TreeNodeData {
	id: string;
	title: React.ReactNode;
	children: TreeNodeData[];
	level: number;
	isLeaf?: boolean;
}

export interface TreeProps {
	items: TreeNodeData[];
	selectedKey: string;
	onSelected: (key: string) => void;
	expandedKeys: Set<string>;
	onExpanded: (keySet: Set<string>) => void;
	renderIcon?: (toggleExpand: () => void) => React.ReactNode;
	renderNode?: (node: TreeNodeData) => React.ReactNode;
	nodeHeight?: number;
}

interface TreeState {
	flatNodes: TreeNodeData[];
}

class Tree extends React.Component<TreeProps, TreeState> {
	constructor(props: TreeProps) {
		super(props);
		this.renderRow = this.renderRow.bind(this);
		this.renderNode = this.renderNode.bind(this);
		this.flattenTree = this.flattenTree.bind(this);
		this.onNodeToggleExpand = this.onNodeToggleExpand.bind(this);
		this.state = {
			flatNodes: this.flattenTree(props.items),
		};
	}

	componentDidUpdate(prevProps: TreeProps) {
		if (this.props.items !== prevProps.items ||
			this.props.expandedKeys !== prevProps.expandedKeys ||
			this.props.selectedKey !== prevProps.selectedKey) {
			this.setState({
				flatNodes: this.flattenTree(this.props.items),
			});
		}
	}

	flattenTree(nodes: TreeNodeData[]): TreeNodeData[] {
		nodes.forEach(p => p.level = 0);
		const stack: TreeNodeData[] = [...nodes];

		const map: TreeNodeData[] = [];

		while (stack.length) {
			const current = stack.shift()!;
			map.push(current);
			if (this.props.expandedKeys.has(current.id)) {
				for (let i = current.children.length - 1; i >= 0; i--) {
					const child = current.children[i];
					child.level = current.level + 1;
					stack.unshift(child);
				}
			}
		}

		return map;
	}

	renderRow({ index, style }: ListChildComponentProps) {
		const node = this.state.flatNodes[index];

		return (
			<div style={style}>
				<TreeNode {...node}
					onExpanded={this.onNodeToggleExpand}
					onSelected={this.props.onSelected}
					height={this.props.nodeHeight || 30}/>
			</div>
		);
	}

	renderNode(node: TreeNodeData): React.ReactNode {
		return
	}

	renderTitle(title: React.ReactNode): React.ReactNode {
		return <span></span>
	}

	// renderExpandIcon(isExpanded: boolean): React.ReactNode {

	// }

	onNodeToggleExpand(key: string) {
		const isExpanded = this.props.expandedKeys.has(key);
		const newSet = new Set(this.props.expandedKeys);

		if (isExpanded) {
			newSet.delete(key);
		} else {
			newSet.add(key);
		}
		this.props.onExpanded(newSet);
	}

	render() {
		return (
			<TreeNodeContext.Provider value={{
				expandedKeys: this.props.expandedKeys,
				selectedKey: this.props.selectedKey,
			}}>
				<List
					overscanCount={20}
					height={500}
					itemCount={this.state.flatNodes.length}
					itemSize={this.props.nodeHeight || 30}
					width={300}
				>
					{this.renderRow}
				</List>
			</TreeNodeContext.Provider>
		)
	}
}

export default React.memo(Tree);
