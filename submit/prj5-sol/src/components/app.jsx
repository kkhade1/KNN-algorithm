import React from 'react';

const { useState } = React;

import makeKnnWsClient from './knn-ws-client.mjs';

import Canvas from './canvas'
const DEFAULT_WS_URL = 'https://zdu.binghamton.edu:2345';



export default function App(props) {
  //TODO
  
  return (
  <form classname="App">
  	<label>Knn Webservice URL</label>
  	<input type="text" size="40" value={DEFAULT_WS_URL}/>
  	<Canvas></Canvas><br></br>
  	<button onClick={this.handleResetClick}>reset</button>
  	<button onClick={this.handleResetClick}>classify</button>
  	<select>
  		<option value="1">1</option>
  		<option value="2">2</option>
  	</select>
  	<p>error message</p>
  </form>
  )
}
 
