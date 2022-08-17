import React from 'react';

const { useState } = React;

import makeKnnWsClient from './knn-ws-client.mjs';

import DigitImageRecognizer from './digit-image-recognizer.jsx';

const DEFAULT_WS_URL = 'https://zdu.binghamton.edu:2345';

export default function App(props) {

  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
  const wsUrlChangeHandler = ev => setWsUrl(ev.target.value);

  const knnWs = makeKnnWsClient(wsUrl);
  return [
    //form for entering backend web services URL
    <form key="url-form" id="url-form">
      <label htmlFor="ws-url">KNN Web Services URL</label>
      <input id="ws-url" name="ws-url" size="40"
             value={wsUrl} onChange={wsUrlChangeHandler}/>
    </form>,
    <DigitImageRecognizer key="recognizer" knnWs={ knnWs }/>
  ];

}
