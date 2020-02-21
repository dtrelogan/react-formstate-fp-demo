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
        <FormScope formstate={formstate} form={form}>
          <FormField name='address' required>
            <InputAndFeedback type='text' label='Address'/>
          </FormField>
        </FormScope>
      </Card.Body>
    </Card>
  );
}
