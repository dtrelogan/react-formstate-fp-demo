import React, { useState } from 'react';
import { rff, useFormstate, FormScope, FormField } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import Contact, { initialModel as contactInitialModel, validationSchema as contactValidationSchema } from './Contact.jsx';


const initialModel = {
  name: '',
  contact: contactInitialModel
};


const testModel = {
  name: 'Buster Brown',
  contact: {
    age: 14,
    emails: [
      {
        type: 'HOME',
        email: 'buster@cs.brown.edu',
        mailingAddress: {
          address: 'Front bedroom dog bed'
        }
      }
    ]
  }
};


const validationSchema = {
  fields: {
    name: { required: true }
  },
  scopes: {
    'contact': { schema: contactValidationSchema }
  }
}


export default function MiscTest(props) {

  const options = buildFormOptions(props);
  options.adaptors = [InputAndFeedback];

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema);

  let formstate, form, setFormstate;

  if (props.useFormRef) {
    [formstate, form] = useFormstate(initialFormstate, options);
  }
  else {
    [formstate, setFormstate] = useState(initialFormstate, options);
    form = {setFormstate, ...options};
  }

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit}>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name'>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormScope name='contact'>
            <Contact nestedForm/>
          </FormScope>
        </FormScope>
      </DemoForm>
    </DemoFormContainer>
  );
}


function validateName(name) {
  if (name[0] === name[0].toLowerCase()) {
    return 'Name must be capitalized.';
  }
}



function submit(form) {

  function customPromise(validModel) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if ('apifailure' === validModel.name.toLowerCase()) {
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


MiscTest.testModel = testModel;
