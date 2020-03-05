import React from 'react';
import Address, { initialModel as addressInitialModel, validationSchema as addressValidationSchema } from './Address.jsx';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import { Button, Card } from 'react-bootstrap';
// import Button from 'react-bootstrap/Button';
// import Card from 'react-bootstrap/Card';

const emailInitialModel = {
  type: 'Home',
  email: '',
  mailingAddress: addressInitialModel
};

const emailValidationSchema = {
  fields: {
    type: { required: true },
    email: { required: true, validate: validateEmail, validateAsync: [verifyEmail, 'onBlur'] }
  },
  scopes: {
    mailingAddress: { schema: addressValidationSchema }
  }
};

export const initialModel = {
  age: '',
  emails: []
};

export const validationSchema = {
  fields: {
    age: { required: true, validate: validateAge }
  },
  scopes: {
    emails: { required: true, schemaForEach: emailValidationSchema }
  }
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
              <FormField name='type'>
                <InputAndFeedback type='select' label='Type' inputProps={{optionValues: [{id: 'Home', text: 'Home'},{id: 'Work', text: 'Work'},{id: 'Other', text: 'Other'}]}}/>
              </FormField>
              <FormField name='email'>
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
      <FormField name='age'>
        <InputAndFeedback type='number' label='Age'/>
      </FormField>
      <FormScope name='emails'>
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
    fs = rff.addModelKey(fs, modelKey, emailInitialModel, emailValidationSchema);
    return rff.synclyValidate(fs, modelKey, form);
  });
}

function removeEmail(form, i) {
  form.setFormstate(fs => {
    fs = rff.deleteModelKey(fs, `emails.${i}`);
    return rff.synclyValidate(fs, 'emails', form);
  })
}

// Test field-async in a nested form

function verifyEmail(value, formstate, form) {
  if (value === rff.getInitialValue(formstate, 'email')) {
    return formstate;
  }

  formstate = rff.setAsyncStarted(formstate, 'email', 'Verifying email...');
  const asyncToken = rff.getAsyncToken(formstate, 'email');

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
        return rff.setAsynclyValid(asyncToken, fs, 'email', 'The email was verified successfully.');
      }

      fs = rff.setAsynclyInvalid(asyncToken, fs, 'email', 'The email failed verification.');

      return fs;
    });
  }).catch((err) => {
    form.setFormstate((fs) => {
      return rff.setAsyncError(asyncToken, fs, 'email', err, 'An error occurred while verifying the email.');
    });
  });

  return [formstate, asyncToken, promise];
}
