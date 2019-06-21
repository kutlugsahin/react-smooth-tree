import * as React from 'react';
import { TreeProps, TreeItem, TreeNodeItem, NodeState, TreeNodeContextProps } from './interface';
import { treeBuilder, TreeBuilder } from './treeBuilder';
import { TreeNode } from './TreeNode';
import { FixedSizeList as List, ListChildComponentProps, FixedSizeList } from 'react-window';

const TreeNodeContext = React.createContext<TreeNodeContextProps>({
	expandedKeys: new Set(),
	selectedKey: '',
	loadingKeys: new Set(),
	leafKeys: new Set(),
	height: 30,
});

export interface TreeClassState {
	treeStructure: TreeBuilder;
}

class Tree extends React.Component<TreeProps, TreeClassState> {
	private listRef: React.RefObject<FixedSizeList> = React.createRef();

	constructor(props: TreeProps) {
		super(props);
		this.onNodeToggleExpand = this.onNodeToggleExpand.bind(this);
		this.onNodeKeyDown = this.onNodeKeyDown.bind(this);
		this.setTreeStructure = this.setTreeStructure.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.setExpanded = this.setExpanded.bind(this);
		this.loadItems = this.loadItems.bind(this);
		this.renderNode = this.renderNode.bind(this);
		this.getItemKey = this.getItemKey.bind(this);
		this.getTreeNodeState = this.getTreeNodeState.bind(this);

		this.state = {
			treeStructure: treeBuilder(props.items, {
				onToggleExpanded: this.onNodeToggleExpand,
				onKeyDown: this.onNodeKeyDown,
				onSelected: props.onSelected,
			}, props),
		}
	}

	public componentDidUpdate(prevProps: TreeProps) {
		if (prevProps.items !== this.props.items || prevProps.expandedKeys !== this.props.expandedKeys) {
			this.setTreeStructure();
		}
	}

	private setTreeStructure() {
		this.setState({
			treeStructure: treeBuilder(this.props.items, {
				onToggleExpanded: this.onNodeToggleExpand,
				onKeyDown: this.onNodeKeyDown,
				onSelected: this.props.onSelected,
			}, this.props)
		});
	}

	private setLoading(id: string, isLoading = true) {
		const loadingKeySet = new Set(this.props.loadingKeys);
		isLoading ? loadingKeySet.add(id) : loadingKeySet.delete(id);
		this.props.onLoadingKeysChanged(loadingKeySet);
	}

	private setExpanded(id: string, expanded = true) {
		const expandedKeySet = new Set(this.props.expandedKeys);
		expanded ? expandedKeySet.add(id) : expandedKeySet.delete(id);
		this.props.onExpandedKeysChanged(expandedKeySet);
	}

	private loadItems(node: TreeNodeItem) {
		if (this.props.load) {
			this.setLoading(node.id);

			this.props.load(node.id).then((result: TreeItem[]) => {
				this.setLoading(node.id, false);
				node.children = result;
				node.item.children = result;
				this.props.onItemsChanged([...this.props.items]);
			});
		}
	}

	private onNodeToggleExpand(id: string) {
		const isExpanded = this.props.expandedKeys.has(id);
		if (isExpanded) {
			this.setExpanded(id, false);
		} else {
			this.setExpanded(id);
		}

		// call load if necessary
		if (this.state.treeStructure) {
			const node = this.state.treeStructure.getNodeById(id);
			if (node) {
				if (!isExpanded && !node.children && this.props.load) {
					this.loadItems(node);
				}
			}
		}
	}

	private onNodeKeyDown(id: string, event: React.KeyboardEvent) {
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
	}

	private getTreeNodeState(id: string): NodeState {
		const { loadingKeys, leafKeys, expandedKeys } = this.props;
		if (loadingKeys.has(id))
			return NodeState.Loading;

		if (leafKeys.has(id))
			return NodeState.Leaf;

		if (expandedKeys.has(id))
			return NodeState.Expanded;

		return NodeState.Collapsed;
	}

	private renderNode({ index, style }: ListChildComponentProps) {
		if (this.state.treeStructure) {
			const node = this.state.treeStructure.flatNodes[index];
			return (
				<div style={style}>
					<TreeNodeContext.Consumer>
						{(context: TreeNodeContextProps) => {
							return (
								<TreeNode {...node}
									onToggleExpanded={this.onNodeToggleExpand}
									onSelected={this.props.onSelected}
									onKeyDown={this.onNodeKeyDown}
									nodeState={this.getTreeNodeState(node.id)}
									isSelected={context.selectedKey === node.id}
									height={context.height}
								/>
							)
						}}
					</TreeNodeContext.Consumer>
				</div>
			);
		}
		return null;
	}

	private getItemKey(index: number) {
		return this.state.treeStructure.flatNodes[index].id;
	}

	render() {
		if (this.state.treeStructure) {
			const { expandedKeys, selectedKey, loadingKeys, leafKeys, nodeHeight } = this.props;
			return (
				<TreeNodeContext.Provider value={{
					expandedKeys,
					selectedKey,
					loadingKeys,
					leafKeys,
					height: nodeHeight || 30
				}}>
					<List
						ref={this.listRef}
						height={500}
						itemCount={this.state.treeStructure.flatNodes.length}
						itemSize={nodeHeight || 30}
						width={'auto'}
						itemKey={this.getItemKey}
						children={this.renderNode}
					/>
				</TreeNodeContext.Provider>
			)
		}

		return null;
	}
}

export default Tree;
