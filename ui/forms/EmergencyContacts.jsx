import React, { useState } from 'react';
import { rff, useFormstate, FormScope, FormField } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import EmergencyContact, { initialModel as emergencyContactInitialModel } from './EmergencyContact.jsx';


const initialModel = {
  name: '',
  roomNumber: '',
  emergencyContact1: emergencyContactInitialModel,
  // emergencyContact2: emergencyContactInitialModel
};


const testModel = {
  name: 'Elyse Donnelly Keaton',
  roomNumber: '456',
  emergencyContact1: {
    name: 'Jennifer Keaton Barnes',
    email: 'family@ties.tv',
    phone: '111-222-3333'
  },
  // emergencyContact2: {
  //   name: 'Alex Keaton',
  //   email: 'm@jfox.com',
  //   phone: '212-111-2222'
  // }
};


export default function EmergencyContacts(props) {

  const options = buildFormOptions(props);
  options.adaptors = [InputAndFeedback];

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel);

  let formstate, form, setFormstate;

  if (props.useFormRef) {
    [formstate, form] = useFormstate(initialFormstate, options);
  }
  else {
    [formstate, setFormstate] = useState(initialFormstate);
    form = {setFormstate, ...options};
  }

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit}>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name' required validate={validateName}>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormField name='roomNumber' required>
            <InputAndFeedback type='text' label='Room Number'/>
          </FormField>
          <FormScope name='emergencyContact1'>
            <EmergencyContact nestedForm title='Emergency Contact'/>
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


EmergencyContacts.testModel = testModel;
