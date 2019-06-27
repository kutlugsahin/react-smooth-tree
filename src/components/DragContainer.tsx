import * as React from 'react';

interface DragContainerProps {
    children: (
        isDragging: boolean,
    ) => React.ReactNode;
    rootRef?: React.RefObject<HTMLDivElement>;
}

interface DragContainerState {
    isDragging: boolean;
}

class DragContainer extends React.Component<DragContainerProps, DragContainerState> {
    private container: React.RefObject<HTMLDivElement> = null!;
    constructor(props: DragContainerProps) {
        super(props);
        this.onDragStart = this.onDragStart.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.container = props.rootRef || React.createRef<HTMLDivElement>();
        this.state = {
            isDragging: false,
        };
    }

    public componentDidMount(): void {
        if (this.container.current) {
            this.container.current.addEventListener('dragstart', this.onDragStart);
            this.container.current.addEventListener('dragend', this.onDragEnd);
        }
    }

    public componentWillUnmount(): void {
        if (this.container.current) {
            this.container.current.removeEventListener('dragstart', this.onDragStart);
            this.container.current.removeEventListener('dragend', this.onDragEnd);
            this.container.current.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    public render(): React.ReactNode {
        return (
            <div ref={this.container}>
                {this.props.children(this.state.isDragging)}
            </div>
        );
    }

    private onDragStart(event: DragEvent): void {
        if (this.container.current) {
            this.container.current.addEventListener('mousemove', this.onMouseMove);
            this.setState({
                isDragging: true,
            });
        }
    }

    private onMouseMove(): void {
        if (this.container.current) {
            this.container.current.removeEventListener('mousemove', this.onMouseMove);
            this.setState({
                isDragging: false,
            });
        }
    }

    private onDragEnd(): void {
        this.setState({
            isDragging: false,
        });
    }
}

export default DragContainer;
