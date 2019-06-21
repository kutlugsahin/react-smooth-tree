import classnames from 'classnames';
import * as React from 'react';
import { NodeState, TreeNodeProps } from "./interface";
import styles from './tree.module.scss';


interface TreeNodeState {
	isDraggedOver: boolean;
}

export class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
	private dragOverExpandTimer: any;
	constructor(props: TreeNodeProps) {
		super(props);
		this.setDraggedOver = this.setDraggedOver.bind(this);
		this.onToggle = this.onToggle.bind(this);
		this.state = {
			isDraggedOver: false,
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

	public componentDidUpdate(prevProps: TreeNodeProps, prevState: TreeNodeState) {
		if (!prevState.isDraggedOver && this.state.isDraggedOver) {
			this.dragOverExpandTimer = setTimeout(() => {
				this.onToggle();
			}, 700);
		} else if (prevState.isDraggedOver && !this.state.isDraggedOver) {
			clearTimeout(this.dragOverExpandTimer);
		}
	}

	render() {
		const { level, id, onSelected, onKeyDown, title, isSelected, height } = this.props;
		const { isDraggedOver } = this.state;

		const indentedStyle = {
			paddingLeft: `${level * 20 + 5}px`,
			height: `${height}px`,
		};

		const selectedClass = classnames({
			[styles.node]: true,
			[styles.expanded]: this.props.nodeState === NodeState.Expanded,
			[styles.loading]: this.props.nodeState === NodeState.Loading
		});

		const titleWrapper = classnames({
			[styles.titleWrapper]: true,
			[styles.draggedOver]: isDraggedOver,
			[styles.selected]: isSelected,
		});

		let icon = null;

		switch (this.props.nodeState) {
			case NodeState.Collapsed:
				icon = <span onClick={this.onToggle} className={styles.icon}>▶</span>;
				break;
			case NodeState.Expanded:
				icon = <span onClick={this.onToggle} className={styles.icon}>▶</span>;
				break;
			case NodeState.Leaf:
				icon = <span onClick={this.onToggle} className={styles.icon}>▶</span>;
				break;
			case NodeState.Loading:
				icon = <span onClick={this.onToggle} className={styles.icon}>◠</span>;
				break;
			default:
				break;
		}

		return (
			<div
				draggable
				onDragOver={(e) => {
					e.preventDefault();
					this.setDraggedOver(true);
				}}
				onDrop={() => this.setDraggedOver(false)}
				onDragEnd={() => this.setDraggedOver(false)}
				onDragLeave={() => { this.setDraggedOver(false) }}
				style={indentedStyle}
				className={selectedClass}
				onKeyDown={e => onKeyDown(id, e)}
			>
				{icon}
				<div className={titleWrapper}
					onClick={() => !isSelected && onSelected(id)}
					onDoubleClick={this.onToggle}>
					{title}
				</div>
			</div>
		);

	}
}
