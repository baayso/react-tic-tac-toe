import React from 'react';
import logo from '../../assest/logo.svg';
import './App.css';
import Game from '../Game/Game';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <div>
            <Game/>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
