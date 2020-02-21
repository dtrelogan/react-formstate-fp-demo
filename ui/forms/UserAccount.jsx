import React from 'react';
import { rff, useFormstate, FormScope, FormField } from 'react-formstate-fp';
import DemoFormContainer, { buildFormOptions, DemoForm, driveFormSubmission, submitValidModel } from '../components/DemoFormContainer.jsx';
import { FormGroup, Input, InputFeedback, FormValidationErrorFeedback } from '../components/rffBootstrap.jsx';
import { Form } from 'react-bootstrap';
// import Form from 'react-bootstrap/Form';


const initialModel = {
  name: '',
  username: '',
  password: '',
  confirmPassword: ''
};


const testModel = {
  name: 'Buster Brown',
  username: 'buster',
  password: '',
  confirmPassword: ''
}


function validationSchema({passwordRequired, whenToValidateAsync}) {
  return {
    fields: {
      'name': { required: true, validate: validateName },
      'username': { required: true, validate: validateUsername, validateAsync: [validateUniqueUsername, whenToValidateAsync] },
      'password': { required: passwordRequired, validate: validatePassword }
    },
    scopes: {
      '': { validate: validateConfirmPassword }
    }
  };
}


export default function UserAccount(props) {

  const options = buildFormOptions(props);

  // Options specific to this form.

  options.adaptors = [FormGroup, Input, InputFeedback]; // Automatically forward props to these components.
  options.passwordRequired = !props.model; // If we are creating an account, password is required.
  options.usernameSynclyValid = props.usernameSynclyValid;
  options.clearConfirmPassword = props.clearConfirmPassword;
  options.ignoreEmptyPasswordField = props.ignoreEmptyPasswordField;

  // Use a function so as to only initialize formstate once.

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema(options));
  const [formstate, form] = useFormstate(initialFormstate, options);

  let validationErrorFeedback = null;
  if (form.acknowledgeAsyncErrors) {
    validationErrorFeedback = <FormValidationErrorFeedback formstate={formstate} modelKey='username' form={form}/>;
  }

  return (
    <DemoFormContainer formstate={formstate} form={form}>
      <DemoForm formstate={formstate} form={form} submit={submit}>
        {validationErrorFeedback}
        <FormScope formstate={formstate} form={form}>
          <FormField name='name'>
            <FormGroup>
              <Form.Label>Name</Form.Label>
              <Input type='text'/>
              <InputFeedback/>
            </FormGroup>
          </FormField>
          <FormField name='username'>
            <FormGroup>
              <Form.Label>Username</Form.Label>
              <Input type='text'/>
              <InputFeedback/>
            </FormGroup>
          </FormField>
          <FormField name='password'>
            <FormGroup>
              <Form.Label>Password</Form.Label>
              <Input type='password' handleChange={handlePasswordChange}/>
              <InputFeedback/>
            </FormGroup>
          </FormField>
          <FormField name='confirmPassword'>
            <FormGroup className={form.passwordRequired ? 'required' : ''}>
              <Form.Label>Confirm Password</Form.Label>
              <Input type='password'/>
              <InputFeedback/>
            </FormGroup>
          </FormField>
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


//
// Overriding the change handler to clear the confirmation field if password is changed.
//

function handlePasswordChange(form, value) {
  form.setFormstate((currentFormstate) => {
    if (rff.isInputDisabled(currentFormstate)) {return currentFormstate;}
    if (form.clearConfirmPassword) {
      currentFormstate = rff.setValueAndClearStatus(currentFormstate, 'confirmPassword', '');
    }
    return rff.changeAndValidate(currentFormstate, 'password', value, form);
  });
}



// Scope-level validations are run:
//  1) every time ANY field is changed within that scope,
//  2) on submit, if not already syncly validated, and
//  3) onBlur if not already syncly validated, and form.validateOnBlur === true and ANY field in that scope is blurred.

function validateConfirmPassword(model, formstate, form) {
  formstate = rff.setCustomProperty(formstate, 'confirmPassword', 'suppressFeedback', false);

  const present = model.confirmPassword.trim() !== '';

  if (form.passwordRequired && !present) {
    return rff.setInvalid(formstate, 'confirmPassword', 'Confirm Password is required.');
  }

  if (model.password !== model.confirmPassword) {
    return rff.setInvalid(formstate, 'confirmPassword', 'Password confirmation does not match.');
  }

  if (!present && form.ignoreEmptyPasswordField) {
    // When editing an account, since it's an entirely optional field, do not light up an *empty* confirmation field valid/green.
    formstate = rff.setCustomProperty(formstate, 'confirmPassword', 'suppressFeedback', true);
  }

  return rff.setValid(formstate, 'confirmPassword', '');
}



// Field-level validations are run:
//  1) every time the field is changed,
//  2) onSubmit if the field is not already validated, and
//  3) onBlur if form.validateOnBlur === true and the field is not already validated.

function validateUsername(value, formstate, form) {
  if (value === rff.getInitialValue(formstate, 'username')) {
    return; // This sets username synclyValid. It's an edge case for the usernameSynclyValid option.
  }
  if (/^[0-9]/.test(value)) {
    return 'Usernames cannot start with a number';
  }
  if (!/^[a-zA-Z0-9]+$/.test(value) || value.indexOf(' ') !== -1) {
    return 'Usernames must be alphanumeric and cannot contain whitespace.';
  }
  return form.usernameSynclyValid ? null : rff.setNotValidated(formstate, 'username'); // No feedback until async finishes.
}


function validatePassword(value, formstate, form) {
  if (value === '') {
    // This logic will only run when editing a model, otherwise required validation would have already deemed this field invalid.
    formstate = rff.setValid(formstate, 'password', '');
    if (form.ignoreEmptyPasswordField) {
      // When editing an account, since it's an entirely optional field, do not light up an *empty* password field valid/green.
      formstate = rff.setCustomProperty(formstate, 'password', 'suppressFeedback', true);
    }
    return formstate;
  }
  if (!/^[!-~]+$/.test(value)) {
    return 'Password cannot contain whitespace or non-printable characters.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (value.length < 12) {
    formstate = rff.setValid(formstate, 'password', 'Passwords are ideally longer than 12 characters.');
    return rff.setCustomProperty(formstate, 'password', 'warn', true);
  }
}


// Async validation is more involved...
// Use setAsynclyValid or setAsynclyInvalid in the promise.
// return [formstate, asyncToken, promise]

function validateUniqueUsername(value, formstate, form) {
  if (value === rff.getInitialValue(formstate, 'username')) {
    return rff.setSynclyValid(formstate, 'username');
  }

  formstate = rff.setAsyncStarted(formstate, 'username', 'Verifying unique username...');
  const asyncToken = rff.getAsyncToken(formstate, 'username');

  const promise = new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (value && value.toLowerCase() === 'validationfailure') {
        reject(new Error('Timeout while trying to communicate with the server.'));
      }
      resolve(value !== 'taken' && value !== 'buster');
    }, 2000);
  }).then((isUnique) => {
    form.setFormstate((fs) => {
      // const modelKey = fs.getModelKey(fs, id); // not needed here.
      if (isUnique) {
        return rff.setAsynclyValid(asyncToken, fs, 'username', 'Verified unique.');
      }
      return rff.setAsynclyInvalid(asyncToken, fs, 'username', 'That username is taken. Please choose another.');
    });
  }).catch((err) => {
    form.setFormstate((fs) => {
      return rff.setAsyncError(asyncToken, fs, 'username', err, 'An error occurred while verifying unique username.');
    });
  });

  return [formstate, asyncToken, promise];
}


//
// The submit handler
//

function submit(form) {

  function customPromise(validModel) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if ('apifailure' === validModel.username.toLowerCase()) {
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


UserAccount.testModel = testModel;
