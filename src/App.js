import './App.css';
import React from 'react';
import VAD from 'voice-activity-detection';

class App extends React.Component {
  constructor(params){
    super(params);

    this.state = {
      st: "ACTIVE",
      lv: 1
    };
    this.audioContext = null
  }
  componentDidMount(){
    this.requestMic()

  }
  requestMic = async ()=> {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      if (this.audioContext.state === "suspended") {
        console.warn(
          `audioContext.state is "suspended"; will attempt to resume every 1s`
        );
        const handle = setInterval(() => {
          if (!!this.audioContext && this.audioContext.state === "suspended") {
            this.audioContext.resume();
          } else if (this.audioContext.state === "running") {
            console.debug(
              `audioContext.state is "running"; stopping resuming attempts`
            );
            clearInterval(handle);
          }
        }, 1000);
      }
      navigator.mediaDevices.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      navigator.getUserMedia({audio: true}, this.startUserMedia, this.handleMicConnectError);
     
    } catch (e) {
      this.handleUserMediaError();
    }
  }

  handleUserMediaError = () => {
    console.warn('Mic input is not supported by the browser.');
  }
  
  handleMicConnectError = () => {
    console.warn('Could not connect microphone. Possible rejected by the user or is blocked by the browser.');
  }
  startUserMedia = (stream) => {
    console.log("test");
    console.log(stream);
    var options = {
      useNoiseCapture: false,
      activityCounterThresh: 20,
      activityCounterMax: 30,
      onVoiceStart: function() {
        this.setState({st: "ACTIVE"})
      }.bind(this),
      onVoiceStop: function() {
        this.setState({st: "DEACTIVE"})
      }.bind(this),
      onUpdate: function(val) {
        this.setState({
          lv: val
        })
      }.bind(this)
    };
    VAD(this.audioContext, stream, options);
  }
  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png" className="App-logo" alt="logo" />
          <div>Voice state: {this.state.st}</div>
          <div>Current voice activity value: {this.state.lv}</div>
        </header>
      </div>
    );
  }
}

export default App;
