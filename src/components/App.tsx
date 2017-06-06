import * as React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import 'normalize.css';

import Login from './Login';
import Numbers from './Numbers';
import '../style.css'

interface AppState {
  isLoggedIn: boolean
}

export default class extends React.Component<{}, AppState> {
  constructor() {
    super();
    this.state = { isLoggedIn: false };
  }

  render() {
    return (
      <div>
        <AppBar title="Number Switcher 4000" />
        <div style={{margin: 30}}>
          {this.state.isLoggedIn ?
            <Numbers /> :
            <Login onSuccessfulLogin={() => this.setState({ isLoggedIn: true })} />}
        </div>
      </div>
    );
  }
}
