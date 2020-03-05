import React from 'react';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import { Card } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';


export const initialModel = {
  address: ''
};


export default function Address({formstate, form}) {

  let adaptors = form.adaptors || [];
  adaptors = [...adaptors, InputAndFeedback];
  form = {...form, adaptors};

  return (
    <Card style={{marginBottom: '10px'}}>
      <Card.Body>
        <FormScope formstate={formstate} form={form} validateAsync={verifyAddress}>
          <FormField name='address' required>
            <InputAndFeedback type='text' label='Address'/>
          </FormField>
        </FormScope>
      </Card.Body>
    </Card>
  );
}


// Test scope-async in a nested form

function verifyAddress(model, formstate, form) {
  if (rff.isModelInvalid(formstate)) {return formstate;} // don't bother...

  formstate = rff.setAsyncStarted(formstate, 'address', 'Verifying address...');
  const asyncToken = rff.getAsyncToken(formstate, 'address');

  const promise = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const {address} = model;
      if (address && address.toLowerCase() === 'validationfailure') {
        reject(new Error('Timeout while trying to communicate with the server.'));
      }
      if (address && address.toLowerCase() === 'badaddress') {
        resolve("Address failed verification.");
      }
      resolve(null);
    }, 2000);
  }).then((validationErrors) => {
    form.setFormstate((fs) => {
      if (!validationErrors) {
        return rff.setAsynclyValid(asyncToken, fs, 'address', 'The address was verified successfully.');
      }

      fs = rff.setAsynclyInvalid(asyncToken, fs, 'address', 'The address failed verification.');

      return fs;
    });
  }).catch((err) => {
    form.setFormstate((fs) => {
      return rff.setAsyncError(asyncToken, fs, 'address', err, 'An error occurred while verifying the address.');
    });
  });

  return [formstate, asyncToken, promise];
}
