import React from 'react';
import Address, { initialModel as addressInitialModel, validationSchema as addressValidationSchema } from './AddressJsx.jsx';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


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
              <FormField name='email' required validate={validateEmail}>
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
  })
}
