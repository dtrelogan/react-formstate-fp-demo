import React from 'react';

const waitingStyle = {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0, zIndex: 1, cursor: 'progress'};

export default function({visible}) {
  return <div className='spinner' style={visible ? waitingStyle : {}}/>;
}
