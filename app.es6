// Decided to go heavy polyfill to ensure the demo works for as many as possible.
import 'core-js/es';

// Alternatively, I could polyfill the es6 requirements only:
// import 'core-js/es/promise'; // This app, and react-formstate-fp, requires promises.
// import 'core-js/es/map'; // https://reactjs.org/docs/javascript-environment-requirements.html
// import 'core-js/es/set'; // https://reactjs.org/docs/javascript-environment-requirements.html
// import 'raf/polyfill'; // https://reactjs.org/docs/javascript-environment-requirements.html

// For async/await, webpack seems to need @babel/plugin-transform-runtime to make things work. The below did not work.
// It doesn't seem to set the regeneratorRuntime object globally. Not sure if this is a webpack issue or what.
// import "regenerator-runtime/runtime"; // It's probably better to use the babel runtime with webpack anyway.

import { createElement } from 'react';
import ReactDOM from 'react-dom/client';
import Demo from './ui/app/Demo.jsx';

// Note that as of Feb 2026, React Bootstrap is not compatible with React 19.
// I changed the below to be compatible with React 19,
// but I'll have to stick with React 18 in package.json.

let root = ReactDOM.createRoot(
  document.getElementById('react-mount-point')
);
root.render(createElement(Demo));

