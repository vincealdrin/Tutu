import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { Menu, Button, Icon } from 'semantic-ui-react';
import Home from '../Home';
import Counter from '../Counter';
import Sidebar from '../Sidebar';
import './styles.css';

class App extends Component {
  state = {
    isSidebarExpanded: true,
  }

  toggleSidebarExpand = () => this.setState({ isSidebarExpanded: !this.state.isSidebarExpanded })

  render() {
    return (
      <div>
        <Sidebar isExpanded={this.state.isSidebarExpanded}>
          <Menu className="app-menu">
            <Menu.Item>
              <Button onClick={this.toggleSidebarExpand} icon>
                <Icon name="content" />
              </Button>
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item>
                Logout
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <main>
            <Route exact path="/" component={Home} />
            <Route exact path="/counter" component={Counter} />
          </main>
        </Sidebar>
      </div>
    );
  }
}

export default App;
