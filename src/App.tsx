import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Tree from './components/Tree';
import { TreeItem } from './components/interface';

interface Props {
  
}


interface State {
  items: TreeItem[];
  selectedKey: string;
  expandedKeys: Set<string>;
  leafKeys: Set<string>;
  loadingKeys: Set<string>;
}

const data: TreeItem[] = [];

for (let i = 0; i < 1; i++) {
  const ch: TreeItem[] = [];
  for (let j = 0; j < 1; j++) {
    ch.push({
      id: `${i}-${j}`,
      title: `item ${i} klsdjfskl dfsdklfjsdflk sfjdlksd fjslkdfj sldf children ${j}`,
    });
  }
  data.push({
    id: `${i}`,
    title: `item ${i}`,
    children: ch,
  })
}

class App extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: data,
      selectedKey: '',
      expandedKeys: new Set(['0']),
      leafKeys: new Set(['1']),
      loadingKeys: new Set(['2']),
    };
  }
  render() {
    return (
      <div className="App">
        <Tree
          nodeHeight={24}
          items={this.state.items}
          onSelected={key => this.setState({ selectedKey: key })}
          selectedKey={this.state.selectedKey}
          expandedKeys={this.state.expandedKeys}
          onExpandedKeysChanged={e => this.setState({ expandedKeys: e })}
          leafKeys={this.state.leafKeys}
          onLeafKeysChanged={leafKeys => this.setState({ leafKeys })}
          loadingKeys={this.state.loadingKeys}
          onLoadingKeysChanged={loadingKeys => this.setState({ loadingKeys })}
          onItemsChanged={(items) => { this.setState({items}) }}
          load={(id: string) => {
            return new Promise((res) => {
              setTimeout(() => {
                res(Array(10).fill(true).map((_, i: number) => ({
                  id: `${id}-${i}`,
                  title: `item ${id}-${i}`,
                } as TreeItem)))
              }, 1000);
            });
          }}
        />
      </div>
    );
  }
}

export default App;
