import React, { useState, useRef } from 'react';
import { rff, FormScope, FormField } from 'react-formstate-fp';
import Spinner from '../components/Spinner.jsx';
import DemoFormContainer, { buildFormOptions, FormSuccessFeedback } from '../components/DemoFormContainer.jsx';
import { InputAndFeedback, FormSubmissionErrorFeedback, ScopeFeedback, Submit } from '../components/rffBootstrap.jsx';
import { Form, ListGroup } from 'react-bootstrap';
// import Form from 'react-bootstrap/Form';
import Instructions from '../components/Instructions.jsx';


const initialModel = {
  username: '',
  password: ''
};

const testModel = {
  username: 'buster',
  password: ''
};

const validationSchema = {
  fields: {
    'username': { required: true, validate: suppressValidFeedback },
    'password': { required: true, validate: suppressValidFeedback }
  }
};


function suppressValidFeedback(value, formstate, form, id) {
  if (form.suppressValidFeedback) {
    const modelKey = rff.getModelKey(formstate, id);
    formstate = rff.setSynclyValid(formstate, modelKey);
    return rff.setCustomProperty(formstate, modelKey, 'suppressFeedback', true);
  }
}


export default function Login(props) {

  const options = buildFormOptions(props);
  options.suppressValidFeedback = props.suppressValidFeedback;
  options.adaptors = [InputAndFeedback, ScopeFeedback];

  const initialFormstate = () => rff.initializeFormstate(props.model || initialModel, validationSchema);
  const [formstate, setFormstate] = useState(initialFormstate);
  const form = {setFormstate, ...options};

  //
  // Customizing the submit button for this form.
  //

  const submitRef = useRef(null);

  function submitHandler(e) {
    e.preventDefault();
    if (form.refocusOnSubmit) {
      submitRef.current.focus();
    }
    submit(form);
  }

  const submitting = rff.isFormSubmitting(formstate);
  const loginFailed = rff.isSynclyInvalid(formstate, '');
  const requiredFieldMissing = !loginFailed && rff.isPrimedModelInvalid(formstate, form.calculatePrimed);
  const submitError = rff.getFormSubmissionError(formstate) && !rff.getFormCustomProperty(formstate, 'errorAcknowledged');

  let submitMessage = 'Login';

  if (submitting) {
    submitMessage = 'Logging in...';
  }
  else if (loginFailed) {
    submitMessage = 'Login failed';
  }
  else if (requiredFieldMissing) {
    submitMessage = 'Please supply your credentials';
  }
  else if (submitError) {
    submitMessage = 'An unexpected error occurred';
  }

  const instructions = (
    <Instructions>
      <ListGroup>
        <ListGroup.Item>Check out the <a href='https://github.com/dtrelogan/react-formstate-fp-demo/blob/HEAD/ui/forms/Login.jsx'>source code</a>.</ListGroup.Item>
        <ListGroup.Item>For a valid login use username 'buster' and password 'password'.</ListGroup.Item>
        <ListGroup.Item>An invalid login sets the root scope invalid and sets the message there. A change to any field within root scope clears the message.</ListGroup.Item>
        <ListGroup.Item>Set username to 'apifailure' to test an error during form submission.</ListGroup.Item>
      </ListGroup>
    </Instructions>
  );

  return (
    <div>
      <DemoFormContainer formstate={formstate} form={form}>
        <Spinner visible={submitting}/>
        <Form onSubmit={submitHandler}>
          <FormSuccessFeedback success={rff.wasSuccessfulSubmit(formstate)}/>
          <FormSubmissionErrorFeedback formstate={formstate} form={form}/>
          <FormScope formstate={formstate} form={form}>
            <ScopeFeedback/>
            <FormField name='username'>
              <InputAndFeedback type='text' label='Username'/>
            </FormField>
            <FormField name='password'>
              <InputAndFeedback type='password' label='Password'/>
            </FormField>
            <Submit
              invalid={requiredFieldMissing || loginFailed}
              submitting={submitting}
              submitError={submitError}
              message={submitMessage}
              ref={submitRef}
            />
          </FormScope>
        </Form>
        {instructions}
      </DemoFormContainer>
    </div>
  );
}


function submit(form) {
  form.setFormstate((formstate) => {
    if (rff.isFormSubmitting(formstate)) {return formstate;}

    formstate = rff.startFormSubmission(formstate);
    formstate = rff.synclyValidateForm(formstate, form);

    if (!rff.isModelValid(formstate)) {
      return rff.cancelFormSubmission(formstate);
    }

    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const {model} = formstate;
        if ('apifailure' === model.username.toLowerCase()) {
          reject(new Error('A timeout occurred while trying to communicate with the server.'));
        }
        else if ('buster' === model.username.toLowerCase() && 'password' === model.password) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }, 2000);
    }).then(successfulLogin => {
      form.setFormstate(fs => {
        if (!successfulLogin) {
          fs = rff.setSynclyInvalid(fs, '', 'Invalid username or password');
        }
        return rff.cancelFormSubmission(fs);
      });
    }).catch(err => {
      form.setFormstate(fs => {
        fs = rff.setFormSubmissionError(fs, err);
        return rff.cancelFormSubmissionKeepInputDisabled(fs);
      });
    });

    return formstate;
  });
}


Login.testModel = testModel;
