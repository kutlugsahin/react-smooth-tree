import classnames from 'classnames';
import * as React from 'react';
import { InputEvent, NodeState, TreeNodeProps } from './interface';
import styles from './style.module.scss';

interface TreeNodeState {
    isDraggedOver: boolean;
    isDragging: boolean;
}

export class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
    private dragOverExpandTimer: any;
    constructor(props: TreeNodeProps) {
        super(props);
        this.setDraggedOver = this.setDraggedOver.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.state = {
            isDraggedOver: false,
            isDragging: false,
        };
    }

    public componentDidMount(): void {
        if (this.props.nodeState === NodeState.LOADING) {
            this.props.onRequestLoad(this.props.id);
        }
    }

    public componentDidUpdate(prevProps: TreeNodeProps, prevState: TreeNodeState): void {
        if (!prevState.isDraggedOver && this.state.isDraggedOver) {
            if (this.props.nodeState === NodeState.COLLAPSED) {
                this.dragOverExpandTimer = setTimeout(() => {
                    this.onToggle();
                }, 700);
            }
        } else if (prevState.isDraggedOver && !this.state.isDraggedOver) {
            clearTimeout(this.dragOverExpandTimer);
        }

        if (prevProps.nodeState !== NodeState.LOADING && this.props.nodeState === NodeState.LOADING) {
            this.props.onRequestLoad(this.props.id);
        }
    }

    public render(): React.ReactNode {
        const { level, id, onSelected, title, isSelected, height, getNodeClassName, item, nodeState, renderNode } = this.props;
        const { isDraggedOver, isDragging } = this.state;

        const icon = this.renderNodeIcon();
        const draggableProps = this.getDraggableProps();

        const nodeRowStyle = {
            paddingLeft: `${level * 20}px`,
            height: `${height}px`,
        };
        let renderedNodeContent = null;

        if (renderNode) {
            renderedNodeContent = renderNode({
                draggableProps,
                isDragging,
                isDraggedOver,
                isSelected,
                item,
                onSelected: (event: InputEvent) => onSelected(id, event),
                state: nodeState,
                nodeIcon: icon,
                onToggleExpand: this.onToggle,
            });
        } else {

            const titleWrapperHeight = `${height - 4}px`;

            let titleWrapper = classnames({
                [styles.titleWrapper]: true,
                [styles.draggedOver]: isDraggedOver,
                [styles.selected]: isSelected,
            });

            if (getNodeClassName) {
                const externalClasses = getNodeClassName({
                    isDraggedOver,
                    isDragging,
                    isSelected,
                    item,
                    state: nodeState,
                });

                titleWrapper = classnames({
                    [titleWrapper]: true,
                    [externalClasses]: true,
                });
			}
			
			const nodeClasses = classnames({
				[styles.node]: true,
			})

            renderedNodeContent = (
				<div className={nodeClasses}>
                    {icon}
                    <div
                        {...draggableProps}
                        className={titleWrapper}
                        style={{ height: titleWrapperHeight, lineHeight: titleWrapperHeight }}
                        onDoubleClick={this.onToggle}
                        onClick={(event: InputEvent) => !isSelected && onSelected(id, event)}
                    >
                        {title}
                    </div>
                </div>
            );
        }

        return (
            <div style={nodeRowStyle}>
                {renderedNodeContent}
            </div>
        );
    }

    private setDraggedOver(isDraggedOver: boolean): void {
        this.setState({ isDraggedOver });
    }

    private onToggle(): void {
        // if (this.props.nodeState & (NodeState.COLLAPSED | NodeState.EXPANDED)) {
        this.props.onToggleExpanded(this.props.id);
        // }
    }

    private renderNodeIcon(): React.ReactNode {
        const { renderNodeIcon, nodeState } = this.props;
        let icon = null;

        if (renderNodeIcon) {
            icon = renderNodeIcon(nodeState, this.onToggle);
        } else {
            const iconProps: { className?: string, onClick?: () => void, children?: React.ReactNode } = {};
            switch (nodeState) {
                case NodeState.COLLAPSED:
                    iconProps.className = styles.icon;
                    iconProps.onClick = this.onToggle;
                    iconProps.children = '▸';
                    break;
                case NodeState.EXPANDED:
                    iconProps.className = `${styles.icon} ${styles.iconExpanded}`;
                    iconProps.onClick = this.onToggle;
                    iconProps.children = '▸';
                    break;
                case NodeState.LEAF:
                    iconProps.className = styles.icon;
                    break;
                case NodeState.LOADING:
                    iconProps.className = `${styles.icon} ${styles.iconLoading}`;
                    iconProps.children = '◠';
                    break;
                default:
                    break;
            }

            icon = <span {...iconProps} />;
        }

        return icon;
    }

    private getDraggableProps(): any {
        const { item, shouldAllowDrop, dragContext, getItemDragData, onItemDrag, isDraggable } = this.props;
        if (isDraggable) {
            return {
                draggable: true,
                onDragOver: (e: any) => {
                    if (!shouldAllowDrop || (dragContext && shouldAllowDrop(dragContext.item, item, dragContext.data))) {
                        e.preventDefault();
                        this.setState({
                            isDraggedOver: true,
                        });
                    }
                },
                onDrop: () => this.setDraggedOver(false),
                onDragEnd: () => this.setDraggedOver(false),
                onDragLeave: () => this.setDraggedOver(false),
                onDrag: (e: React.DragEvent) => {
                    if (getItemDragData) {
                        e.dataTransfer.setData('text', getItemDragData(item));
                    }
                    onItemDrag(item);
                },
            };
        }

        return {};
    }
}
