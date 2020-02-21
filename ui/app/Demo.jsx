import React, { useState } from 'react';
import UserAccountForm from '../forms/UserAccount.jsx';
import VerifiedAddressForm from '../forms/VerifiedAddress.jsx';
import EventForm from '../forms/Event.jsx';
import LoginForm from '../forms/Login.jsx';
import DependentsForm from '../forms/Dependents.jsx';
import EmergencyContactsForm from '../forms/EmergencyContacts.jsx';
import ReadmeForm from '../forms/Readme.jsx';
import { Jumbotron, Form, Col, Card, ButtonToolbar, Button } from 'react-bootstrap';
// import Jumbotron from 'react-bootstrap/Jumbotron';
// import Form from 'react-bootstrap/Form';
// import Col from 'react-bootstrap/Col';
// import Card from 'react-bootstrap/Card';
// import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
// import Button from 'react-bootstrap/Button';
import Select from '../components/Select.jsx';
// test forms
// import UserAccountAwaitForm from '../testForms/UserAccountAwait.jsx';
// import MiscTestForm from '../testForms/MiscTest.jsx';
// import MiscTestJsxForm from '../testForms/MiscTestJsx.jsx';


let nextKey = 0;


function initialState(queryString) {
  return {
    formName: chooseInitialForm(queryString),
    formInstanceKey: nextKey++,
    whenToPrime: 'onChange',
    whenToValidateAsync: 'onBlur',
    showConfig: false,
    edit: false,
    refocusOnSubmit: false,
    runAsyncIfInvalid: true,
    acknowledgeAsyncErrors: false,
    primeSubmitFeedback: 'afterAsync',
    usernameSynclyValid: true,
    clearConfirmPassword: false,
    ignoreEmptyPasswordField: false,
    suppressValidFeedback: false,
    useFormRef: true
  };
}


export default function Demo() {
  const [state, setState] = useState(initialState(location.search));

  function resetForm() {
    setState({...state, formInstanceKey: nextKey++});
  }

  const DemoForm = forms[state.formName].type;

  let runAsyncIfInvalidCheckbox = null, acknowledgeAsyncErrorsCheckbox = null, usernameSynclyValidCheckbox = null,
  clearConfirmPasswordCheckbox = null, ignoreEmptyPasswordFieldCheckbox = null, suppressValidFeedbackCheckbox = null,
  useFormRefCheckbox = null;

  if (state.formName === 'UserAccount' || state.formName === 'VerifiedAddress' || state.formName === 'UserAccountAwait') {
    runAsyncIfInvalidCheckbox = (
      <Form.Check
        id='runAsyncIfInvalid'
        type='checkbox'
        label='Run Async onSubmit Even If Model Is Syncly Invalid'
        checked={state.runAsyncIfInvalid}
        onClick={() => setState({...state, formInstanceKey: nextKey++, runAsyncIfInvalid: !state.runAsyncIfInvalid})}
        onChange={() => {}}
      />
    );
  }

  if (state.formName === 'UserAccount' || state.formName === 'UserAccountAwait') {
    acknowledgeAsyncErrorsCheckbox = (
      <Form.Check
        id='acknowledgeAsyncErrors'
        type='checkbox'
        label='Require Acknowledgement of Async Validation Errors'
        checked={state.acknowledgeAsyncErrors}
        onClick={() => setState({...state, formInstanceKey: nextKey++, acknowledgeAsyncErrors: !state.acknowledgeAsyncErrors})}
        onChange={() => {}}
      />
    );

    usernameSynclyValidCheckbox = (
      <Form.Check
        id='usernameSynclyValid'
        type='checkbox'
        label='Set Username Syncly Valid Before Async Finishes'
        checked={state.usernameSynclyValid}
        onClick={() => setState({...state, formInstanceKey: nextKey++, usernameSynclyValid: !state.usernameSynclyValid})}
        onChange={() => {}}
      />
    );

    clearConfirmPasswordCheckbox = (
      <Form.Check
        id='clearConfirmPassword'
        type='checkbox'
        label='Reset Confirm Password When Password Changes'
        checked={state.clearConfirmPassword}
        onClick={() => setState({...state, formInstanceKey: nextKey++, clearConfirmPassword: !state.clearConfirmPassword})}
        onChange={() => {}}
      />
    );

    if (state.edit) {
      ignoreEmptyPasswordFieldCheckbox = (
        <Form.Check
          id='ignoreEmptyPasswordField'
          type='checkbox'
          label='No Feedback for Empty Password Field'
          checked={state.ignoreEmptyPasswordField}
          onClick={() => setState({...state, formInstanceKey: nextKey++, ignoreEmptyPasswordField: !state.ignoreEmptyPasswordField})}
          onChange={() => {}}
        />
      );
    }
  }

  if (state.formName === 'Login') {
    suppressValidFeedbackCheckbox = (
      <Form.Check
        id='suppressValidFeedback'
        type='checkbox'
        label='Suppress Valid Feedback'
        checked={state.suppressValidFeedback}
        onClick={() => setState({...state, formInstanceKey: nextKey++, suppressValidFeedback: !state.suppressValidFeedback})}
        onChange={() => {}}
      />
    );
  }

  if (state.formName === 'EmergencyContacts' || state.formName === 'MiscTest' || state.formName === 'MiscTestJsx') {
    useFormRefCheckbox = (
      <Form.Check
        id='useFormRef'
        type='checkbox'
        label='Use Form Ref (for testing purposes)'
        checked={state.useFormRef}
        onClick={() => setState({...state, formInstanceKey: nextKey++, useFormRef: !state.useFormRef})}
        onChange={() => {}}
      />
    );
  }

  return (
    <div>
      <Jumbotron>
        <div className='main-title'>react-formstate-fp-demo</div>
        <Form className='main-demo-options'>
          <Form.Row>
            <Col xs={12} sm={6} md={6} lg={5}>
              <Form.Group className='select-form' controlId='selectForm'>
                <Form.Label>Choose a form</Form.Label>
                <Select
                  optionValues={Object.keys(forms).map(id => ({id, name: forms[id].name}))}
                  value={state.formName}
                  onChange={e => setState({...state, formInstanceKey: nextKey++, formName: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3} md={3} lg={2}>
              <Form.Group className='select-when-to-prime' controlId='selectWhenToPrime'>
                <Form.Label>Prime</Form.Label>
                <Select
                  optionValues={[{id: 'onChange', name: 'onChange'},{id: 'onChangeThenBlur', name: 'onChangeThenBlur'},{id: 'onBlur', name: 'onBlur'},{id: 'onSubmit', name: 'onSubmit'}]}
                  value={state.whenToPrime}
                  onChange={(e) => setState({...state, formInstanceKey: nextKey++, whenToPrime: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3} md={3} lg={2}>
              <Form.Group className='select-validate-async-on' controlId='selectValidateAsyncOn'>
                <Form.Label>Validate Async</Form.Label>
                <Select
                  optionValues={[{id: 'onChange', name: 'onChange'},{id: 'onBlur', name: 'onBlur'},{id: 'onSubmit', name: 'onSubmit'}]}
                  value={state.whenToValidateAsync}
                  onChange={(e) => setState({...state, formInstanceKey: nextKey++, whenToValidateAsync: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Form.Row>
          <ButtonToolbar>
            <Button size='md' style={{marginRight: '10px'}} onClick={resetForm}>
              Reset Form
            </Button>
            <Button
              size='md'
              variant={state.showConfig ? 'secondary' : 'outline-secondary'}
              onClick={() => setState({...state, showConfig: !state.showConfig})}
            >
              Other Settings
            </Button>
          </ButtonToolbar>
          <Card style={state.showConfig ? null : {display: 'none'}}>
            <Card.Body>
              <Form.Row>
                <Col xs={12}>
                  <Form.Check
                    id='editExistingModelCheck'
                    type='checkbox'
                    label='Edit Existing Model'
                    checked={state.edit}
                    onClick={() => setState({...state, formInstanceKey: nextKey++, edit: !state.edit})}
                    onChange={() => {}}
                  />
                  <Form.Check
                    id='refocusOnSubmit'
                    type='checkbox'
                    label='Refocus onSubmit'
                    checked={state.refocusOnSubmit}
                    onClick={() => setState({...state, formInstanceKey: nextKey++, refocusOnSubmit: !state.refocusOnSubmit})}
                    onChange={() => {}}
                  />
                  {runAsyncIfInvalidCheckbox}
                  {acknowledgeAsyncErrorsCheckbox}
                  {usernameSynclyValidCheckbox}
                  {clearConfirmPasswordCheckbox}
                  {ignoreEmptyPasswordFieldCheckbox}
                  {suppressValidFeedbackCheckbox}
                  {useFormRefCheckbox}
                </Col>
              </Form.Row>
              <Form.Row>
                <Col xs={12} sm={6} lg={3}>
                  <Form.Group style={{marginTop: '10px'}} className='select-prime-submit-feedback' controlId='selectPrimeSubmitFeedback'>
                    <Form.Label>Prime Submit Feedback</Form.Label>
                    <Select
                      optionValues={[{id: 'immediately', name: 'immediately'},{id: 'afterAsync', name: 'afterAsync'},{id: 'onCancel', name: 'onCancel'}]}
                      value={state.primeSubmitFeedback}
                      onChange={(e) => setState({...state, formInstanceKey: nextKey++, primeSubmitFeedback: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Form.Row>
            </Card.Body>
          </Card>
        </Form>
      </Jumbotron>
      <div className='demo-form-div'>
        <DemoForm
          resetForm={resetForm}
          key={state.formInstanceKey}
          whenToPrime={state.whenToPrime}
          whenToValidateAsync={state.whenToValidateAsync}
          model={state.edit ? DemoForm.testModel : null}
          refocusOnSubmit={state.refocusOnSubmit}
          runAsyncIfInvalid={state.runAsyncIfInvalid}
          acknowledgeAsyncErrors={state.acknowledgeAsyncErrors}
          primeSubmitFeedback={state.primeSubmitFeedback}
          usernameSynclyValid={state.usernameSynclyValid}
          clearConfirmPassword={state.clearConfirmPassword}
          ignoreEmptyPasswordField={state.ignoreEmptyPasswordField}
          suppressValidFeedback={state.suppressValidFeedback}
          useFormRef={state.useFormRef}
        />
      </div>
    </div>
  );
}




const forms = {
  'UserAccount' : {
    name: 'User Account (async validation)',
    type: UserAccountForm
  },
  'Event' : {
    name: 'Event (scope validation)',
    type: EventForm
  },
  'VerifiedAddress' : {
    name: 'Verified Address (scope async)',
    type: VerifiedAddressForm
  },
  'Login' : {
    name: 'Login (scope-level messaging)',
    type: LoginForm
  },
  'Dependents' : {
    name: 'Dependents (nested form components)',
    type: DependentsForm
  },
  'EmergencyContacts' : {
    name: 'Emergency Contacts (jsx schemas)',
    type: EmergencyContactsForm
  },
  'Readme' : {
    name: 'RFF Readme Example',
    type: ReadmeForm
  },
  // 'MiscTest' : {
  //   name: 'Testing (if this shows I forgot to comment it out...)',
  //   type: MiscTestForm
  // },
  // 'MiscTestJsx' : {
  //   name: 'Testing-Jsx (if this shows I forgot to comment it out...)',
  //   type: MiscTestJsxForm
  // },
  // 'UserAccountAwait' : {
  //   name: 'Testing-Await (if this shows I forgot to comment it out...)',
  //   type: UserAccountAwaitForm
  // }
};



function chooseInitialForm(queryString) {
  queryString = (queryString || '').toLowerCase();
  if (queryString.endsWith('form=useraccount')) {return 'UserAccount';}
  if (queryString.endsWith('form=verifiedaddress')) {return 'VerifiedAddress';}
  if (queryString.endsWith('form=event')) {return 'Event';}
  if (queryString.endsWith('form=login')) {return 'Login';}
  if (queryString.endsWith('form=dependents')) {return 'Dependents';}
  if (queryString.endsWith('form=emergencycontacts')) {return 'EmergencyContacts';}
  if (queryString.endsWith('form=readme')) {return 'Readme';}
  // if (queryString.endsWith('form=testing')) {return 'MiscTest';}
  // if (queryString.endsWith('form=testingjsx')) {return 'MiscTestJsx';}
  // if (queryString.endsWith('form=await')) {return 'UserAccountAwait';}
  return 'UserAccount';
}
