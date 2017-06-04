import * as React from 'react';

import Login from './Login';
import Numbers from './Numbers';

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
        <h1>Number Switcher 4000</h1>
        {this.state.isLoggedIn ?
          <Numbers /> :
          <Login onSuccessfulLogin={() => this.setState({ isLoggedIn: true })} />}
      </div>
    );
  }
}
