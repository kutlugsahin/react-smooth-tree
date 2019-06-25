import classnames from 'classnames';
import * as React from 'react';
import { FixedSizeList, FixedSizeList as List, ListChildComponentProps } from 'react-window';
import DragContainer from './DragContainer';
import { DragContext, NodeState, TreeItem, TreeNodeContextProps, TreeNodeItem, TreeProps } from './interface';
import styles from './tree.module.scss';
import { treeBuilder, TreeBuilder } from './treeBuilder';
import { TreeNode } from './TreeNode';

// tslint:disable-next-line:variable-name
const TreeNodeContext = React.createContext<TreeNodeContextProps>({
    expandedKeys: {},
    selectedKey: '',
    loadingKeys: {},
    height: 30,
});

export interface TreeClassState {
    treeStructure: TreeBuilder;
    dragContext?: DragContext;
}

class Tree extends React.Component<TreeProps, TreeClassState> {
    private listRef: React.RefObject<FixedSizeList> = React.createRef();

    constructor(props: TreeProps) {
        super(props);
        this.onNodeToggleExpand = this.onNodeToggleExpand.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.setTreeStructure = this.setTreeStructure.bind(this);
        this.setLoading = this.setLoading.bind(this);
        this.setExpanded = this.setExpanded.bind(this);
        this.loadItems = this.loadItems.bind(this);
        this.renderNode = this.renderNode.bind(this);
        this.getItemKey = this.getItemKey.bind(this);
        this.onRequestLoad = this.onRequestLoad.bind(this);
        this.getTreeNodeState = this.getTreeNodeState.bind(this);

        this.selectNext = this.selectNext.bind(this);
        this.selectPrevious = this.selectPrevious.bind(this);
        this.selectParent = this.selectParent.bind(this);

        this.state = {
            treeStructure: treeBuilder(props.items, props.expandedKeys),
        };
    }

    public componentDidUpdate(prevProps: TreeProps): void {
        if (prevProps.items !== this.props.items || prevProps.expandedKeys !== this.props.expandedKeys) {
            this.setTreeStructure();
        }
    }

    public scrollTo(id: string): void {
        if (this.listRef.current) {
            const index = this.state.treeStructure.indexOf(id);

            if (index > -1) {
                this.listRef.current.scrollToItem(index);
            }
        }
    }

    public render(): React.ReactNode {
        const { expandedKeys, selectedKey, loadingKeys, nodeHeight, getNodeClassName, getItemDragData, shouldAllowDrop, renderNodeIcon, renderNode } = this.props;
        return (
            <DragContainer>
                {(isDragging: boolean) => {
                    const classes = classnames({
                        [styles.root]: true,
                        [styles.isDragging]: isDragging,
                    });
                    return (
                        <div tabIndex={0} className={classes} onKeyDown={this.onKeyDown}>
                            <TreeNodeContext.Provider value={{
                                getNodeClassName,
                                getItemDragData,
                                shouldAllowDrop,
                                expandedKeys,
                                selectedKey,
                                loadingKeys,
                                renderNodeIcon,
                                renderNode,
                                height: nodeHeight || 30,
                                dragContext: this.state.dragContext,
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
                        </div>
                    );
                }}
            </DragContainer>
        );
    }

    private setTreeStructure(): void {
        this.setState({
            treeStructure: treeBuilder(this.props.items, this.props.expandedKeys),
        });
    }

    private setLoading(id: string, isLoading: boolean = true): void {
        const loadingKeySet = { ...this.props.loadingKeys };
        isLoading ? (loadingKeySet[id] = true) : (delete loadingKeySet[id]);
        this.props.onLoadingKeysChanged(loadingKeySet);
    }

    private setExpanded(id: string, expanded: boolean = true): void {
        const expandedKeySet = { ...this.props.expandedKeys };
        expanded ? (expandedKeySet[id] = true) : (delete expandedKeySet[id]);
        this.props.onExpandedKeysChanged(expandedKeySet);
    }

    private onRequestLoad(id: string): void {
        const node = this.state.treeStructure.getNodeById(id);
        if (node) {
            this.loadItems(node);
        }
    }

    private loadItems(node: TreeNodeItem): void {
        if (this.props.load) {
            this.setLoading(node.id);

            this.props.load(node.id).then((result: TreeItem[]) => {
                this.setLoading(node.id, false);
                node.children = result;
                node.item.children = result;
                this.props.onItemsChanged([...this.props.items]);
            }).catch(() => {
                this.setLoading(node.id, false);
            });
        }
    }

    private onNodeToggleExpand(id: string): void {
        const isExpanded = this.props.expandedKeys[id];
        if (isExpanded) {
            this.setExpanded(id, false);
        } else {
            this.setExpanded(id);
        }

        // call load if necessary
        const node = this.state.treeStructure.getNodeById(id);
        if (node) {
            if (!isExpanded && !node.children && this.props.load) {
                this.loadItems(node);
            }
        }
    }

    private selectNext(): void {
        const nextNode = this.state.treeStructure.getNextNode(this.props.selectedKey);
        if (nextNode) {
            this.props.onSelected(nextNode.id);
            this.scrollTo(nextNode.id);
        }
    }

    private selectPrevious(): void {
        const prevNode = this.state.treeStructure.getPreviousNode(this.props.selectedKey);
        if (prevNode) {
            this.props.onSelected(prevNode.id);
            this.scrollTo(prevNode.id);
        }
    }

    private selectParent(): void {
        const parentNode = this.state.treeStructure.getParentNode(this.props.selectedKey);
        if (parentNode) {
            this.props.onSelected(parentNode.id);
            this.scrollTo(parentNode.id);
        }
    }

    private onKeyDown(event: React.KeyboardEvent): void {
        if (this.props.selectedKey) {
            switch (event.keyCode) {
                case 8:
                    this.selectParent();
                    break;
                case 9: {
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.selectPrevious();
                    } else {
                        this.selectNext();
                    }
                }
                    break;
                case 38:
                    event.preventDefault();
                    this.selectPrevious();
                    break;
                case 40:
                    event.preventDefault();
                    this.selectNext();
                    break;
                case 37:
                    if (this.props.expandedKeys[this.props.selectedKey]) {
                        event.preventDefault();
                        this.setExpanded(this.props.selectedKey, false);
                    }
                    break;
                case 13:
                case 39:
                    if (!this.props.expandedKeys[this.props.selectedKey]) {
                        event.preventDefault();
                        this.setLoading(this.props.selectedKey);
                        this.setExpanded(this.props.selectedKey, true);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private getTreeNodeState(id: string, children?: TreeItem[]): NodeState {
        const { loadingKeys, expandedKeys } = this.props;
        if (loadingKeys[id] && !children) {
            return NodeState.LOADING;
        }

        if (children && children.length === 0) {
            return NodeState.LEAF;
        }

        if (expandedKeys[id]) {
            return NodeState.EXPANDED;
        }

        return NodeState.COLLAPSED;
    }

    private renderNode({ index, style }: ListChildComponentProps): any {
        const node = this.state.treeStructure.flatNodes[index];
        return (
            <div style={style}>
                <TreeNodeContext.Consumer>
                    {(context: TreeNodeContextProps) => {
                        return (
                            <TreeNode {...node}
                                onToggleExpanded={this.onNodeToggleExpand}
                                onSelected={this.props.onSelected}
                                nodeState={this.getTreeNodeState(node.id, node.children)}
                                isSelected={context.selectedKey === node.id}
                                height={context.height}
                                onRequestLoad={this.onRequestLoad}
                                getNodeClassName={context.getNodeClassName}
                                getItemDragData={context.getItemDragData}
                                shouldAllowDrop={context.shouldAllowDrop}
                                onItemDrag={this.onItemDrag}
                                dragContext={context.dragContext}
                                renderNodeIcon={context.renderNodeIcon}
                                renderNode={context.renderNode}
                            />
                        );
                    }}
                </TreeNodeContext.Consumer>
            </div>
        );
    }

    private getItemKey(index: number): string {
        return this.state.treeStructure.flatNodes[index].id;
    }

    private onItemDrag(item: TreeItem): void {
        this.setState({
            dragContext: {
                item,
                data: this.props.getItemDragData ? this.props.getItemDragData(item) : undefined,
            },
        });
    }
}

export default Tree;
