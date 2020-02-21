import React from 'react';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import { Card } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';
import { library as validation } from 'react-formstate-validation';


export const initialModel = {
  name: '',
  email: '',
  phone: ''
};


export default function EmergencyContact({formstate, form, title}) {

  let adaptors = form.adaptors || [];
  adaptors = [...adaptors, InputAndFeedback];
  form = {...form, adaptors};

  return (
    <Card style={{marginBottom: '20px'}}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name' required validate={validateName}>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormField name='email' required validate={validateEmail}>
            <InputAndFeedback type='text' label='Email'/>
          </FormField>
          <FormField name='phone' required>
            <InputAndFeedback type='text' label='Phone'/>
          </FormField>
        </FormScope>
      </Card.Body>
    </Card>
  );
}


function validateName(name) {
  if (name[0] === name[0].toLowerCase()) {
    return 'Name must be capitalized.';
  }
}


function validateEmail(value) {
  if (!validation.email(value)) {
    return 'Not a valid email address';
  }
}
