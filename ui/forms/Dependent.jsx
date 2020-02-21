import React from 'react';
import { FormScope, FormField, rff } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import { Card, Button } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';
// import Button from 'react-bootstrap/Button';


export const initialModel = {
  name: '',
  age: ''
};

export const validationSchema = {
  fields: {
    name: { required: true, validate: validateName },
    age: { required: true }
  }
};

export default function Dependent({formstate, form}) {

  let adaptors = form.adaptors || [];
  adaptors = [...adaptors, InputAndFeedback];
  form = {...form, adaptors};

  return (
    <Card style={{marginBottom: '10px'}}>
      <Card.Body>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name'>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormField name='age'>
            <InputAndFeedback type='select' label='Age' inputProps={{optionValues}}/>
          </FormField>
          <div style={{textAlign: 'right'}}>
            <Button variant="link" onClick={() => removeMe(form)}>remove</Button>
          </div>
        </FormScope>
      </Card.Body>
    </Card>
  );
}


function buildOptionValues() {
  const result = [{id: '', text: 'Please select an age'}];
  for(let i = 0; i < 150; i++) {
    result.push({id: String(i), text: String(i)});
  }
  return result;
}

const optionValues = buildOptionValues();



function validateName(name) {
  if (name[0] === name[0].toLowerCase()) {
    return 'Name must be capitalized.';
  }
}


function removeMe(form) {
  form.setFormstate(fs => rff.deleteModelKeyAndValidateParentScope(fs, '', form));
}
