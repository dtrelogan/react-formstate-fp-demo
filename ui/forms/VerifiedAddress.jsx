import React from 'react';
import { rff, useFormstate } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback, ScopeFeedback } from '../components/rffBootstrap.jsx';
import { ListGroup } from 'react-bootstrap';
import Instructions from '../components/Instructions.jsx';


const initialModel = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: ''
};


const testModel = {
  line1: '123 City St.',
  line2: '#4D',
  city: 'Busytown',
  state: 'RI',
  zip: '02789'
};


const validationSchema = {
  fields: {
    'line1': { required: 'Street Address Line 1 is required.' },
    'city': { required: true },
    'state': { required: true },
    'zip': { required: 'Zipcode is required.' }
  },
  scopes: {
    '': { validateAsync: verifyAddress }
  }
};


export default function VerifiedAddressForm(props) {

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema);
  const [formstate, form] = useFormstate(initialFormstate, buildFormOptions(props));

  const modelKey = (modelKey) => ({formstate, modelKey, form});

  // "Verifying Address..."
  const submitMessage = rff.isFormSubmitting(formstate) && rff.isFormWaiting(formstate) ? rff.getMessage(formstate, '') : null;

  const instructions = (
    <Instructions>
      <ListGroup>
        <ListGroup.Item>Check out the <a href='https://github.com/dtrelogan/react-formstate-fp-demo/blob/HEAD/ui/forms/VerifiedAddress.jsx'>source code</a>.</ListGroup.Item>
        <ListGroup.Item>Scope-level asynchronous validation runs on submit: if line1 contains the word 'city' and line2 is empty, the address will fail verification.</ListGroup.Item>
        <ListGroup.Item>Set line2 to 'validationfailure' to test an error during asynchronous validation.</ListGroup.Item>
        <ListGroup.Item>Set line2 to 'apifailure' to test an error during form submission.</ListGroup.Item>
      </ListGroup>
    </Instructions>
  );

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit} submitMessage={submitMessage} instructions={instructions}>
        <ScopeFeedback {...modelKey('')}/>
        <InputAndFeedback type='text' label='Street Address Line 1' {...modelKey('line1')}/>
        <InputAndFeedback type='text' label='Street Address Line 2' {...modelKey('line2')}/>
        <InputAndFeedback type='text' label='City' {...modelKey('city')}/>
        <InputAndFeedback type='text' label='State' {...modelKey('state')}/>
        <InputAndFeedback type='text' label='Zip' {...modelKey('zip')}/>
      </DemoForm>
    </DemoFormContainer>
  );
}




function verifyAddress(model, formstate, form) {
  if (rff.isModelInvalid(formstate)) {return formstate;} // don't bother...

  formstate = rff.setAsyncStarted(formstate, '', 'Verifying address...');
  const asyncToken = rff.getAsyncToken(formstate, '');

  const promise = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const {line1, line2} = model;
      if (line2 && line2.toLowerCase() === 'validationfailure') {
        reject(new Error('Timeout while trying to communicate with the server.'));
      }
      if (line1.toLowerCase().indexOf('city') !== -1 && line2.trim() === '') {
        resolve({line2: 'Apartment number is required.'});
      }
      resolve(null);
    }, 2000);
  }).then((validationErrors) => {
    form.setFormstate((fs) => {
      if (!validationErrors) {
        return rff.setAsynclyValid(asyncToken, fs, '', 'The address was verified successfully.');
      }

      fs = rff.setAsynclyInvalid(asyncToken, fs, '', 'The address failed verification.');

      Object.keys(validationErrors).forEach(modelKey => {
        fs = rff.setInvalid(fs, modelKey, validationErrors[modelKey]);
      });

      return fs;
    });
  }).catch((err) => {
    form.setFormstate((fs) => {
      return rff.setAsyncError(asyncToken, fs, '', err, 'An error occurred while verifying the address.');
    });
  });

  return [formstate, asyncToken, promise];
}


function submit(form) {

  function customPromise(validModel) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if ('apifailure' === validModel.line2.toLowerCase()) {
          reject(new Error('A timeout occurred while trying to communicate with the server.'));
        }
        else {
          resolve();
        }
      }, 2000);
    });
  }

  driveFormSubmission(form, (validModel) => submitValidModel(form, validModel, customPromise(validModel)));
}


VerifiedAddressForm.testModel = testModel;
