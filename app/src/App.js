import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import LinearProgress from 'material-ui/LinearProgress';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import './App.css';

const EMPTY_STRING = ""

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      analysis_result: 0,
      my_text_to_analyze: EMPTY_STRING,
      key_phrases: EMPTY_STRING,
      language: 'en'
    };

  }
  
  onTextChanged(event) {
    this.setState({
      my_text_to_analyze: event.target.value
    })
  }

  onSimpleButtonClick(event) {

    console.log(this.state);
    const authOptions = {
        method: 'POST',
        url: 'http://localhost:3000/analyze-sentiment',
        data: {
          my_text_to_analyze: this.state.my_text_to_analyze,
          language: this.state.language
        },
        json: true
    };
    axios(authOptions)
        .then((response) => {
            console.log("Sentiment response...");
            console.log(JSON.stringify(response.data));
            console.log(response.status);

            this.setState({
              analysis_result: Number(response.data.documents[0].score) * 100
            })
        })
        .catch((error) => {
            console.log(error)
        })
  }

  onComplexButtonClick(event) {
    console.log("Clcking comblex button");

    const authOptions = {
      method: 'POST',
      url: 'http://localhost:3000/analyze-keyphrases',
      data: {
        my_text_to_analyze: this.state.my_text_to_analyze,
        language: this.state.language
      },
      json: true
    };

    axios(authOptions)
      .then((response) => {
        console.log("Key phrases response");
        console.log(JSON.stringify(response.data));
        console.log(response.status);

        const keyPhr = response.data.documents[0].keyPhrases;

        console.log("Key phrases: ")
        console.log(keyPhr)

        this.setState( {
          key_phrases: EMPTY_STRING
        })

        for (const ph in keyPhr) {
          this.setState( {
            key_phrases: this.state.key_phrases + "\n" + keyPhr[ph]
          })
        }
      })
  }
  
  onWatsonButtonClick(event) {
    const authOptions = {
      method: 'POST',
      url: 'http://localhost:3000/analyze-watson',
      data: {
        my_text_to_analyze: this.state.my_text_to_analyze
      },
      json: true
    };

    axios(authOptions)
      .then((response) => {
        console.log("Watson response");
        console.log(JSON.stringify(response.data));
        console.log(response)
      })
  }

  onClearButtonClick(event) {
    this.setState({
      analysis_result: 0,
      my_text_to_analyze: EMPTY_STRING,
      key_phrases: EMPTY_STRING,
    })

    this._textarea.value = EMPTY_STRING
  }

  onChangeLanguage(lang) {
    this.setState({
      language: lang
    })
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1 className="App-title">TEXT ANALYZER DEMO for iThrive</h1>
          </header>

          <RadioButtonGroup className="radioButtonGroup" name="shipSpeed" defaultSelected="en">
            <RadioButton
              value="en"
              label="English (en)"
              onClick={() => this.onChangeLanguage('en')}
              className="radioButton"
            />
            <RadioButton
              value="nl"
              label="Dutch (nl)"
              onClick={() => this.onChangeLanguage('nl')}
              className="radioButton"
            />
          </RadioButtonGroup>

          <TextField 
            ref={(c) => this._textarea = c} 
            onChange={(event) => this.onTextChanged(event)}
            hintText="Enter your phrase here"
            multiLine={true}
            rows={1}
            rowsMax={150}
            >

          </TextField>
          <br/>
          <RaisedButton primary={true} className="buttonClass" onClick = {(event) => this.onSimpleButtonClick(event)}>
            Emotion
          </RaisedButton>
          <RaisedButton primary={true} className="buttonClass" onClick = {(event) => this.onComplexButtonClick(event)}>
            Sentences
          </RaisedButton>
          <RaisedButton primary={true} className="buttonClass" onClick = {(event) => this.onWatsonButtonClick(event)}>
            Complex (Beta)
          </RaisedButton>
          <RaisedButton secondary={true} className="buttonClass"  onClick = {(event) => this.onClearButtonClick(event)}>
            Clear
          </RaisedButton>
          <br/>

          <span>
            Text positivity: {Math.round(this.state.analysis_result)}%
          </span>

          <br />
          <br />

          <div style={{width: '200px', display: 'block', margin: 'auto'}}>
            <LinearProgress min={0} max={100} mode="determinate" value={this.state.analysis_result} />
          </div>

          <br />
          <br />
          <br />
          <br />
          <br />

          <div style={{whiteSpace: 'pre'}}>
            <span>My Key Phrases: </span>
            <br/>
            {this.state.key_phrases}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
