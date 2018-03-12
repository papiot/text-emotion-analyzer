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
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Text analyzer 🎉</h1>
        </header>

        <p>
          Enter the text you want to analyze:
        </p>

        <textarea style={{width: 400, height: 300, fontSize: 22}} onChange={(event) => this.onTextChanged(event)}>

        </textarea>
        <br/>
        <button style={{width: 150, height: 30, fontWeight: 600}} onClick = {(event) => this.onButtonClick(event)}>
          Get Emotion!
        </button>
        <br/>

        <p>
          Text positivity: {this.state.analysis_result}
        </p>
      </div>
    );
  }
}

export default App;
