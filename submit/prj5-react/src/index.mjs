import React from 'react';
import ReactDOMClient from 'react-dom/client';

import App from './components/app.jsx';

window.addEventListener('DOMContentLoaded', () => {
  const app = React.createElement(App);
  const root = ReactDOMClient.createRoot(document.querySelector('#root'));
  root.render(app); //way to create root app under React 18.x.
});


