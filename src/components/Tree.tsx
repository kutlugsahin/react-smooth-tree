import classnames from 'classnames';
import * as React from 'react';
import { FixedSizeList, FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Size, SizeWatcher, watchElementSize } from './watchElementSize';
import DragContainer from './DragContainer';
import { DragContext, InputEvent, InputType, NodeState, TreeBuilder, TreeItem, TreeNodeContextProps, TreeNodeItem, TreeProps } from './interface';
import styles from './style.module.scss';
import { treeBuilder } from './treeBuilder';
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
    height?: number;
}

class Tree extends React.Component<TreeProps, TreeClassState> {
    private listRef: React.RefObject<FixedSizeList> = React.createRef();
    private root: React.RefObject<HTMLDivElement> = React.createRef();
    private sizeWatcher: SizeWatcher = null!;
    private outerContainer: React.RefObject<HTMLDivElement> = React.createRef();

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
        this.onNodeSelected = this.onNodeSelected.bind(this);
        this.selectNext = this.selectNext.bind(this);
        this.selectPrevious = this.selectPrevious.bind(this);
        this.selectParent = this.selectParent.bind(this);

        this.state = {
            treeStructure: treeBuilder(props.items, props.expandedKeys),
        };
    }

    public componentDidUpdate(prevProps: TreeProps, prevState: TreeClassState): void {
        if (prevProps.items !== this.props.items || prevProps.expandedKeys !== this.props.expandedKeys) {
            this.setTreeStructure();
        }

        if (prevState.height === undefined && this.state.height !== undefined) {
            if (this.outerContainer.current) {
                this.outerContainer.current.style.overflowX = 'scroll';
            }
        }
    }

    public componentDidMount(): void {
        if (this.props.height === undefined && this.root.current) {
            const parent = this.root.current.parentElement;

            if (parent) {
                this.sizeWatcher = watchElementSize(parent, (size: Size) => {
                    this.setState({
                        height: size.y,
                    });
                }, 50);
            }
        }
    }

    public componentWillUnmount(): void {
        if (this.sizeWatcher) {
            this.sizeWatcher.dispose();
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
        const { height = this.state.height } = this.props;

        const { expandedKeys, selectedKey, loadingKeys, nodeHeight, getNodeClassName, getItemDragData, shouldAllowDrop, renderNodeIcon, renderNode } = this.props;
        return (
            <DragContainer rootRef={this.root}>
                {(isDragging: boolean) => {
                    const classes = classnames({
                        [styles.root]: true,
                        [styles.isDragging]: isDragging,
                    });
                    return height !== undefined ? (
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
                                    overscanCount={5}
                                    outerRef={this.outerContainer}
                                    ref={this.listRef}
                                    height={height}
                                    itemCount={this.state.treeStructure.flatNodes.length}
                                    itemSize={nodeHeight || 30}
                                    width={'auto'}
                                    // itemKey={this.getItemKey}
                                    children={this.renderNode}
                                />
                            </TreeNodeContext.Provider>
                        </div>
                    ) : null;
                }}
            </DragContainer>
        );
    }

    public getTreeHelper(): TreeBuilder {
        return this.state.treeStructure;
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
                if (this.props.onItemsChanged) {
                    this.props.onItemsChanged([...this.props.items]);
                }
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
        if (this.props.selectedKey) {
            const nextNode = this.state.treeStructure.getNextNode(this.props.selectedKey);
            if (nextNode) {
                this.props.onSelected(nextNode.id, InputType.KEYBOARD);
                this.scrollTo(nextNode.id);
            }
        }
    }

    private selectPrevious(): void {
        if (this.props.selectedKey) {
            const prevNode = this.state.treeStructure.getPreviousNode(this.props.selectedKey);
            if (prevNode) {
                this.props.onSelected(prevNode.id, InputType.KEYBOARD);
                this.scrollTo(prevNode.id);
            }
        }
    }

    private selectParent(): void {
        if (this.props.selectedKey) {
            const parentNode = this.state.treeStructure.getParentNode(this.props.selectedKey);
            if (parentNode) {
                this.props.onSelected(parentNode.id, InputType.KEYBOARD);
                this.scrollTo(parentNode.id);
            }
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
        if (loadingKeys[id]) {
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

    private onNodeSelected(id: string, event: InputEvent): void {
        const touchEvent = event as TouchEvent;

        if (touchEvent.touches) {
            return this.props.onSelected(id, InputType.TOUCH);
        }

        const pointerEvent = event as PointerEvent;

        if (pointerEvent.pointerId) {
            return this.props.onSelected(id, InputType.POINTER);
        }

        this.props.onSelected(id, InputType.MOUSE);
    }

    private renderNode({ index, style }: ListChildComponentProps): any {
        return (
            <div style={style}>
                <TreeNodeContext.Consumer>
                    {(context: TreeNodeContextProps) => {
                        const node = this.state.treeStructure.flatNodes[index];
                        return (
                            <TreeNode {...node}
                                onToggleExpanded={this.onNodeToggleExpand}
                                onSelected={this.onNodeSelected}
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
                                title={this.renderNodeTitle(node.data)}
                                isDraggable={false}
                            />
                        );
                    }}
                </TreeNodeContext.Consumer>
            </div>
        );
    }

    private renderNodeTitle(data: any): React.ReactNode {
        return this.props.renderTitle(data);
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
