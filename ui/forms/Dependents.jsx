import React from 'react';
import { rff, useFormstate, FormScope, FormField } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import Dependent, { initialModel as dependentInitialModel, validationSchema as dependentValidationSchema } from './Dependent.jsx';
import { Button } from 'react-bootstrap';
// import Button from 'react-bootstrap/Button';


const initialModel = {
  name: '',
  dependents: []
};


const testModel = {
  name: 'Mr. & Mrs. Brown',
  dependents: [
    {
      name: 'Charlie Brown',
      age: 8
    },
    {
      name: 'Sally Brown',
      age: 5
    },
    {
      name: 'Snoopy',
      age: 7
    }
  ]
};


const validationSchema = {
  fields: {
    'name': { required: true, validate: validateName }
  },
  scopes: {
    'dependents': { schemaForEach: dependentValidationSchema }
  }
}


export default function Dependents(props) {

  const options = buildFormOptions(props);
  options.adaptors = [InputAndFeedback];

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema);
  const [formstate, form] = useFormstate(initialFormstate, options);

  //
  // dependents
  //

  const model = rff.getValue(formstate, ''); // Good habit to get into. Works in nested forms too.

  let dependents = null;

  if (model.dependents.length > 0) {
    dependents = model.dependents.map((d,i) => {
      return (
        <FormScope key={i} name={i}>
          <Dependent nestedForm/>
        </FormScope>
      );
    });
  }

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit}>
        <FormScope formstate={formstate} form={form}>
          <FormField name='name'>
            <InputAndFeedback type='text' label='Name'/>
          </FormField>
          <FormScope name='dependents'>
            {dependents}
          </FormScope>
          <div style={{textAlign: 'right', marginBottom: '10px'}}>
            <Button variant='link' onClick={() => addDependent(form)}>add dependent</Button>
          </div>
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


function addDependent(form) {
  form.setFormstate(fs => {
    const i = rff.getValue(fs, 'dependents').length;
    const modelKey = `dependents[${i}]`;
    fs = rff.addModelKey(fs, modelKey, dependentInitialModel, dependentValidationSchema);
    return rff.synclyValidate(fs, modelKey, form);
  });
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


Dependents.testModel = testModel;
