import React, { Component, createRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Tree from './components/Tree';
import { TreeItem, KeySet } from './components/interface';

interface Props {
  
}


interface State {
  items: TreeItem[];
  selectedKey: string;
  expandedKeys: KeySet;
  loadingKeys: KeySet;
}

const data: TreeItem[] = [];

for (let i = 0; i < 1000; i++) {
  const ch: TreeItem[] = [];
  for (let j = 0; j < 100; j++) {
    ch.push({
      id: `${i}-${j}`,
      data: `item ${i} klsdjfskl dfsdklfjsdflk sfjdlksd fjslkdfj sldf children ${j}`,
    });
  }
  data.push({
    id: `${i}`,
    data: `item ${i}`,
    children: ch,
  })
}

class App extends React.Component<Props, State> {
  private tree = createRef<Tree>();
  constructor(props: any) {
    super(props);
    this.state = {
      items: data,
      selectedKey: '100',
      expandedKeys: {
        '0': true, '0-0': true, '0-0-0': true, '0-0-0-0': true
      },
      loadingKeys: {
        '0-0': true, '0-0-0':true, '0-0-0-0': true
      },
    };
  }
  render() {
    return (
      <div className="App">
        <button onClick={() => this.tree.current!.scrollTo('100')}>goto 100</button>
        <Tree
          ref={this.tree}
          nodeHeight={28}
          items={this.state.items}
          height={700}
          onSelected={key => this.setState({ selectedKey: key })}
          selectedKey={this.state.selectedKey}
          expandedKeys={this.state.expandedKeys}
          onExpandedKeysChanged={e => this.setState({ expandedKeys: e })}
          loadingKeys={this.state.loadingKeys}
          onLoadingKeysChanged={loadingKeys => this.setState({ loadingKeys })}
          onItemsChanged={(items) => { this.setState({ items }) }}
          renderTitle={p => p}
          load={(id: string) => {
            return new Promise((res) => {
              setTimeout(() => {
                res(Array(10).fill(true).map((_, i: number) => ({
                  id: `${id}-${i}`,
                  data: `item ${id}-${i}`,
                  children: []
                } as TreeItem)))
              }, 1000);
            });
          }}
          // renderNode={(props) => {
          //   return (
          //     <div>
          //       <span onClick={props.onToggleExpand}>{props.state}</span>
          //       <span>{props.item.title}</span>
          //     </div>
          //   )
          // }}
        />
      </div>
    );
  }
}

export default App;
