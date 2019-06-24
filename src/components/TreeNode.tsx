import classnames from 'classnames';
import * as React from 'react';
import { NodeState, TreeNodeProps } from "./interface";
import styles from './tree.module.scss';


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

	private setDraggedOver(isDraggedOver: boolean): void {
		this.setState({ isDraggedOver });
	}

	private onToggle(): void {
		if (this.props.nodeState & (NodeState.Collapsed | NodeState.Expanded)) {
			this.props.onToggleExpanded(this.props.id);
		}
	}

	public componentDidMount() {
		if (this.props.nodeState === NodeState.Loading) {
			this.props.onRequestLoad(this.props.id);
		}
	}

	public componentDidUpdate(prevProps: TreeNodeProps, prevState: TreeNodeState) {
		if (!prevState.isDraggedOver && this.state.isDraggedOver) {
			if (this.props.nodeState === NodeState.Collapsed) {
				this.dragOverExpandTimer = setTimeout(() => {
					this.onToggle();
				}, 700);
			}
		} else if (prevState.isDraggedOver && !this.state.isDraggedOver) {
			clearTimeout(this.dragOverExpandTimer);
		}

		if (prevProps.nodeState !== NodeState.Loading && this.props.nodeState === NodeState.Loading) {
			this.props.onRequestLoad(this.props.id);
		}
	}

	render() {
		const { level, id, onSelected, title, isSelected, height, getNodeClassName, draggable, getItemDragData, shouldAllowDrop, item, dragContext, onItemDrag, nodeState, renderNodeIcon } = this.props;
		const { isDraggedOver, isDragging } = this.state;

		const nodeRowStyle = {
			paddingLeft: `${level * 20}px`,
			height: `${height}px`,
		};

		const selectedClass = classnames({
			[styles.node]: true,
			[styles.expanded]: nodeState === NodeState.Expanded,
			[styles.loading]: nodeState === NodeState.Loading
		});

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

		let icon = null;

		if (renderNodeIcon) {
			icon = renderNodeIcon(nodeState, this.onToggle);
		} else {
			let iconProps: { className?: string, onClick?: () => void, children?: React.ReactNode } = {};
			switch (nodeState) {
				case NodeState.Collapsed:
					iconProps.className = styles.icon;
					iconProps.onClick = this.onToggle;
					iconProps.children = '▸';
					break;
				case NodeState.Expanded:
					iconProps.className = `${styles.icon} ${styles.iconExpanded}`;
					iconProps.onClick = this.onToggle;
					iconProps.children = '▸';
					break;
				case NodeState.Leaf:
					iconProps.className = styles.icon;
					break;
				case NodeState.Loading:
					iconProps.className = styles.icon;
					iconProps.children = '◠';
					break;
				default:
					break;
			}

			icon = <span {...iconProps} />;
		}

		const dragProps = {
			draggable,
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
				onItemDrag(item)
			},
		}

		return (
			<div
				style={nodeRowStyle}
				className={selectedClass}
			>
				{icon}
				<div
					className={titleWrapper}
					{...dragProps}

					style={{ height: titleWrapperHeight, lineHeight: titleWrapperHeight }}
					onClick={() => !isSelected && onSelected(id)}
					onDoubleClick={this.onToggle}
				>
					{title}
				</div>
			</div>
		);

	}
}
