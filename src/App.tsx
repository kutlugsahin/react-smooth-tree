import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Tree, { TreeNodeData } from './components/Tree';

interface Props {
  
}


interface State {
  items: TreeNodeData[];
  selectedKey: string;
  expandedKeys: Set<string>;
}

const data: TreeNodeData[] = [];

for (let i = 0; i < 1000; i++) {
  const ch: TreeNodeData[] = [];
  for (let j = 0; j < 10; j++) {
    ch.push({
      id: `${i}-${j}`,
      title: `item ${i} children ${j}`,
      children: [],
      level: 0,
    });
  }
  data.push({
    id: `${i}`,
    title: `item ${i}`,
    children: ch,
    level: 0,
  })
}

class App extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: data,
      selectedKey: '',
      expandedKeys: new Set(),
    };
  }
  render() {
    return (
      <div className="App">
        <Tree
          nodeHeight={20}
          items={this.state.items}
          onSelected={key => this.setState({ selectedKey: key })}
          selectedKey={this.state.selectedKey}
          expandedKeys={this.state.expandedKeys}
          onExpanded={e => this.setState({ expandedKeys:e })}
        />
      </div>
    );
  }
}

export default App;
