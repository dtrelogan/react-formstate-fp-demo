import React, { useState } from 'react';
import { rff, FormScope } from 'react-formstate-fp';
import { InputAndFeedback } from '../components/rffBootstrap.jsx';
import Spinner from '../components/Spinner.jsx';
import { ListGroup } from 'react-bootstrap';
import Instructions from '../components/Instructions.jsx';


const initialModel = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
};

// This example configures validation using a "schema". You can alternatively
// configure validation directly in the JSX. The documentation shows how.
// Validation configuration is intentionally nothing fancy.
// It is simplest to express validation, especially client-side, through code.

const validationSchema = {
  fields: {
    'oldPassword': { required: true },
    'newPassword': { required: true, validate: validatePassword },
    'confirmNewPassword': { required: true }
  },
  scopes: {
    '': { validate: validatePasswordConfirmation }
  }
};

const initialFormstate = rff.initializeFormstate(initialModel, validationSchema);


export default function ExampleForm()
{
  const [formstate, setFormstate] = useState(initialFormstate);

  const form = {
    setFormstate, // Tell react-formstate-fp how to update your formstate.
    adaptors: [InputAndFeedback], // Tell RFF to pass formstate, form (and modelKey) props to this component.
    calculatePrimed: rff.primeOnChange // Tell the InputAndFeedback component when to show messages.
  };

  const submitting = rff.isFormSubmitting(formstate);
  const disabled = submitting || rff.isPrimedModelInvalid(formstate, form.calculatePrimed);

  const instructions = (
    <Instructions>
      <ListGroup>
        <ListGroup.Item>The <a href='https://github.com/dtrelogan/react-formstate-fp-demo/blob/HEAD/ui/forms/Readme.jsx'>source code</a>, straight from the <a href='https://github.com/dtrelogan/react-formstate-fp/blob/HEAD/doc/BasicExample.md'>documentation</a>.</ListGroup.Item>
        <ListGroup.Item>Set old password to 'TheRightPassword' to change the password successfully.</ListGroup.Item>
        <ListGroup.Item>Set old password to 'TestThrowingAnError' to test an error during form submission.</ListGroup.Item>
      </ListGroup>
    </Instructions>
  );

  return (
    <form onSubmit={(e) => submit(e, form)}>
      <Spinner visible={submitting}/>
      <FormScope formstate={formstate} form={form}>
        <InputAndFeedback modelKey='oldPassword' type='password' label='Old Password'/>
        <InputAndFeedback modelKey='newPassword' type='password' label='New Password'/>
        <InputAndFeedback modelKey='confirmNewPassword' type='password' label='Confirm New Password'/>
      </FormScope>
      <input type='submit' value='Submit' disabled={disabled}/>
      {instructions}
    </form>
  );
}

// validatePasswordConfirmation is specified at root scope so it will be called when any of the fields change.
// Scope-level validation functions typically return an updated formstate object.

function validatePasswordConfirmation(model, formstate) {
  if (model.confirmNewPassword) {
    if (model.confirmNewPassword !== model.newPassword) {
      return rff.setInvalid(formstate, 'confirmNewPassword', 'Password confirmation does not match.');
    }
    else {
      return rff.setValid(formstate, 'confirmNewPassword', '');
    }
  }
  else {
    // The "required" validation handles this case.
  }
}

// Field-specific validation methods run when the specific field is changed and are easier to work with than scope validation methods.

function validatePassword(value) {
  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
}

// The submit process is fully customizable. Or you can use a convenience function, like this example:

function submit(e, form) {
  e.preventDefault();
  rff.driveFormSubmission(form, submitValidModel);
}


function submitValidModel(model, form) {

  // Simulate sending the valid model to your server.

  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (model.oldPassword === 'TestThrowingAnError') {
        reject(new Error('A timeout occurred while trying to communicate with the server.'));
      }
      else {
        resolve(model.oldPassword === 'TheRightPassword');
      }
    }, 2000);
  }).then(isPasswordCorrect => {
    form.setFormstate(fs => {
      if (isPasswordCorrect) {
        // Normally you'd route somewhere else if the password was updated...
        fs = rff.setValid(fs, 'oldPassword', 'Your password was changed successfully.');
        // Alternatively you could set this in root scope and add a feedback widget for that scope. This is a valuable concept.
        // fs = rff.setValid(fs, '', 'Your password was changed successfully.');
      }
      else {
        fs = rff.setInvalid(fs, 'oldPassword', 'Incorrect password!');
      }
      return rff.cancelFormSubmission(fs); // Doing this in both cases because it's a demo.
    });
  }).catch(err => {
    form.setFormstate(fs => {
      // You could add feedback functionality to your form around the presence of a submission error.
      // fs = rff.setFormSubmissionError(fs, err);
      // But for this simple demo just raise an alert...
      alert(err.message);
      return rff.cancelFormSubmission(fs);
    });
  });
}
