import React from 'react';

import makeKnnWsClient from './knn-ws-client.mjs';
import DigitImageRecognizer from './digit-image-recognizer.jsx';

const DEFAULT_WS_URL = 'https://zdu.binghamton.edu:2345';

export default class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      wsUrl: DEFAULT_WS_URL,
      knnWs: makeKnnWsClient(DEFAULT_WS_URL)
    };
    this.wsUrlChangeHandler = this.wsUrlChangeHandler.bind(this);
  }

  wsUrlChangeHandler(ev) {
    const wsUrl = ev.target.value;
    this.setState({wsUrl, knnWs: makeKnnWsClient(wsUrl)});
  }

  render() {
    return [
      //form for entering backend web services URL
      <form key="url-form" id="url-form">
        <label htmlFor="ws-url">KNN Web Services URL</label>
        <input id="ws-url" name="ws-url" size="40"
               value={this.state.wsUrl} onChange={this.wsUrlChangeHandler}/>
      </form>,
      <br key="br1"/>,
      <br key="br2"/>,
      <DigitImageRecognizer key="recognizer" knnWs={ this.state.knnWs }/>
    ];
  }

}
