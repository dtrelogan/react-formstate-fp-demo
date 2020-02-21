import React from 'react';
import { rff, useFormstate, FormScope, FormField } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';


const initialModel = {
  name: '',
  startDate: null,
  endDate: null
};


const testModel = {
  name: 'Trip to the Beach',
  startDate: new Date(2020,0,31),
  endDate: new Date(2050,0,31)
};


const validationSchema = {
  fields: {
    'name': { required: true },
    'startDate': { required: true },
    'endDate': { required: true }
  },
  scopes: {
    '': { validate: validateDates }
  }
};


export default function Event(props) {

  const options = buildFormOptions(props);
  options.adaptors = [InputAndFeedback];

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema);
  const [formstate, form] = useFormstate(initialFormstate, options);

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit}>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name'>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormField name='startDate'>
            <InputAndFeedback type='date' label='Start Date'/>
          </FormField>
          <FormField name='endDate'>
            <InputAndFeedback type='date' label='End Date'/>
          </FormField>
        </FormScope>
      </DemoForm>
    </DemoFormContainer>
  );
}


function validateDates(model, formstate) {
  if (model.endDate) {
    if (!model.startDate) {return rff.setSynclyValid(formstate, 'endDate', '');}
    if (model.startDate <= model.endDate) {
      formstate = rff.setSynclyValid(formstate, 'startDate', '');
      return rff.setSynclyValid(formstate, 'endDate', '');
    }
    formstate = rff.setSynclyInvalid(formstate, 'startDate', 'Start Date must be before End Date.');
    return rff.setSynclyInvalid(formstate, 'endDate', 'End Date must be after Start Date.');
  }
  else if (model.startDate) {return rff.setSynclyValid(formstate, 'startDate', '');}
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


Event.testModel = testModel;
