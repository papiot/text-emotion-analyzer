import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      analysis_result: -1,
      my_text_to_analyze: ""
    };
  }
  
  onTextChanged(event) {
    this.setState({
      my_text_to_analyze: event.target.value
    })
  }

  onButtonClick(event) {

    console.log(this.state);
    const authOptions = {
        method: 'POST',
        url: 'http://localhost:3000/analyze',
        data: {
          my_text_to_analyze: this.state.my_text_to_analyze
        },
        json: true
    };
    axios(authOptions)
        .then((response) => {
            console.log(response.data);
            console.log(response.status);

            this.setState({
              analysis_result: Number(response.data) * 100
            })
        })
        .catch((error) => {
            console.log(error)
        })
  }

  onButtonClick

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <p>
          Enter the text you want to analyze:
        </p>

        <textarea onChange={(event) => this.onTextChanged(event)}>

        </textarea>
        <br/>
        <button onClick = {(event) => this.onButtonClick(event)}>
          Get Emotion!
        </button>
        <br/>

        <p>
          My text is: {this.state.analysis_result}
        </p>
      </div>
    );
  }
}

export default App;
