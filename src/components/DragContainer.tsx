import * as React from 'react';

interface DragContainerProps {
	children: (
		isDragging: boolean
	) => React.ReactNode;
}

interface DragContainerState {
	isDragging: boolean;
}

class DragContainer extends React.Component<DragContainerProps, DragContainerState> {
	private container = React.createRef<HTMLDivElement>();
	constructor(props: DragContainerProps) {
		super(props);
		this.onDragStart = this.onDragStart.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.state = {
			isDragging: false,
		};
	}

	public componentDidMount() {
		if (this.container.current) {
			this.container.current.addEventListener('dragstart', this.onDragStart);
			this.container.current.addEventListener('dragend', this.onDragEnd);
		}
	}

	public componentWillUnmount() {
		if (this.container.current) {
			this.container.current.removeEventListener('dragstart', this.onDragStart);
			this.container.current.removeEventListener('dragend', this.onDragEnd);
			this.container.current.removeEventListener('mousemove', this.onMouseMove);
		}
	}

	private onDragStart(event: DragEvent) {
		if (this.container.current) {
			this.container.current.addEventListener('mousemove', this.onMouseMove)
			this.setState({
				isDragging: true,
			});
		}
	}

	private onMouseMove() {
		if (this.container.current) {
			this.container.current.removeEventListener('mousemove', this.onMouseMove);
			this.setState({
				isDragging: false,
			})
		}
	}

	private onDragEnd() {
		this.setState({
			isDragging: false,
		})
	}

	render() {
		return (
			<div ref={this.container}>
				{this.props.children(this.state.isDragging)}
			</div>
		)
	}
}

export default DragContainer;
