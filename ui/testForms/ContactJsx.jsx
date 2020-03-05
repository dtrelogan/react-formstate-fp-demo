import React from 'react';
import Address, { initialModel as addressInitialModel, validationSchema as addressValidationSchema } from './AddressJsx.jsx';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import { Button, Card } from 'react-bootstrap';
// import Button from 'react-bootstrap/Button';
// import Card from 'react-bootstrap/Card';


export const initialModel = {
  age: '',
  emails: []
};


const emailInitialModel = {
  type: 'Home',
  email: '',
  mailingAddress: addressInitialModel
};


export default function Contact({formstate, form}) {

  let adaptors = form.adaptors || [];
  adaptors = [...adaptors, InputAndFeedback];

  const model = rff.getValue(formstate, '');
  let emails = null;

  if (model.emails.length > 0) {
    emails = model.emails.map((v, i) => {
      return (
        <Card key={i} style={{marginBottom: '20px'}}>
          <Card.Body>
            <FormScope name={i}>
              <FormField name='type' required>
                <InputAndFeedback type='select' label='Type' inputProps={{optionValues: [{id: 'Home', text: 'Home'},{id: 'Work', text: 'Work'},{id: 'Other', text: 'Other'}]}}/>
              </FormField>
              <FormField name='email' required validate={validateEmail} validateAsync={[verifyEmail, 'onBlur']}>
                <InputAndFeedback type='text' label='Email'/>
              </FormField>
              <FormScope name='mailingAddress'>
                <Address nestedForm/>
              </FormScope>
              <div style={{textAlign: 'right', marginBottom: '10px'}}>
                <Button variant="link" onClick={() => removeEmail(form, i)}>remove</Button>
              </div>
            </FormScope>
          </Card.Body>
        </Card>
      );
    });
  }

  return (
    <FormScope formstate={formstate} form={{...form, adaptors}}>
      <FormField name='age' required validate={validateAge}>
        <InputAndFeedback type='number' label='Age'/>
      </FormField>
      <FormScope name='emails' required>
        {emails}
      </FormScope>
      <div style={{textAlign: 'right', marginBottom: '10px'}}>
        <Button variant="link" onClick={() => addEmail(form)}>Add Email</Button>
      </div>
    </FormScope>
  );
}

function validateAge(value) {
  if (Number(value) < 0) {
    return 'Age cannot be less than zero.';
  }
}

function validateEmail(value) {
  if (!/^\S+@\S+\.\S+$/.test(value)) {
    return 'Not a valid email address';
  }
}

function addEmail(form) {
  form.setFormstate(fs => {
    const i = rff.getValue(fs, 'emails').length;
    const modelKey = `emails.${i}`;
    fs = rff.addModelKey(fs, modelKey, emailInitialModel);
    return rff.synclyValidate(fs, modelKey, form);
  });
}

function removeEmail(form, i) {
  form.setFormstate(fs => {
    fs = rff.deleteModelKey(fs, `emails.${i}`);
    return rff.synclyValidate(fs, 'emails', form);
  });
}


// Test field-async in a nested form

function verifyEmail(value, formstate, form, id) {
  // You don't know which item in the array you are working with so you have to use the id parameter.
  // This is different from the validation schema version, where schemaForEach puts the validation function
  // into a nested scope. This is a quirk of RFF.
  const modelKey = rff.getModelKey(formstate, id);

  if (value === rff.getInitialValue(formstate, modelKey)) {
    return formstate;
  }

  formstate = rff.setAsyncStarted(formstate, modelKey, 'Verifying email...');
  const asyncToken = rff.getAsyncToken(formstate, modelKey);

  const promise = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (value && value.toLowerCase() === 'validation@failure.test') {
        reject(new Error('Timeout while trying to communicate with the server.'));
      }
      if (value && value.toLowerCase() === 'bad@email.test') {
        resolve("email failed verification.");
      }
      resolve(null);
    }, 2000);
  }).then((validationErrors) => {
    form.setFormstate((fs) => {
      if (!validationErrors) {
        return rff.setAsynclyValid(asyncToken, fs, modelKey, 'The email was verified successfully.');
      }

      fs = rff.setAsynclyInvalid(asyncToken, fs, modelKey, 'The email failed verification.');

      return fs;
    });
  }).catch((err) => {
    form.setFormstate((fs) => {
      return rff.setAsyncError(asyncToken, fs, modelKey, err, 'An error occurred while verifying the email.');
    });
  });

  return [formstate, asyncToken, promise];
}
