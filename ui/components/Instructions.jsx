import React from 'react';

export default ({children}) => {
  return (
    <div className='instructions'>
      <hr/>
      <h3>Notes</h3>
      {children}
    </div>
  );
};
