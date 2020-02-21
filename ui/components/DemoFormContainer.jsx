import React, { useState, useEffect, useRef } from 'react';
import { rff } from 'react-formstate-fp';
import Form from 'react-bootstrap/Form';
import Spinner from './Spinner.jsx';
import { calculatePrimed, FormSubmissionErrorFeedback, Submit } from './rffBootstrap.jsx';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';



export function buildFormOptions(props) {

  // The form is reset if these settings are changed...

  return {
    validateOnBlur: props.whenToPrime === 'onBlur',
    // Custom configuration outside of rff. Using form to pass it along.
    calculatePrimed: (formstate, modelKey) => calculatePrimed(formstate, modelKey, props.whenToPrime, props.primeSubmitFeedback),
    whenToValidateAsync: props.whenToValidateAsync,
    refocusOnSubmit: props.refocusOnSubmit,
    runAsyncIfInvalid: props.runAsyncIfInvalid,
    acknowledgeAsyncErrors: props.acknowledgeAsyncErrors
  };

}



export function DemoForm({formstate, form, submit, submitMessage, children}) {

  const submitRef = useRef(null);

  function submitHandler(e) {
    e.preventDefault();
    if (form.refocusOnSubmit) {
      submitRef.current.focus();
    }
    submit(form);
  }

  const submitting = rff.isFormSubmitting(formstate);

  return (
    <Form onSubmit={submitHandler}>
      <Spinner visible={submitting}/>
      <FormSuccessFeedback success={rff.wasSuccessfulSubmit(formstate)}/>
      <FormSubmissionErrorFeedback formstate={formstate} form={form}/>
      {children}
      <Submit
        invalid={rff.isPrimedModelInvalid(formstate, form.calculatePrimed)}
        waiting={submitting && rff.isFormWaiting(formstate)}
        submitting={submitting}
        error={form.acknowledgeAsyncErrors && rff.getFormAsyncErrorModelKeys(formstate).some(k => !rff.wasAsyncErrorDuringSubmit(formstate, k) && !rff.getCustomProperty(formstate, k, 'errorAcknowledged'))}
        submitError={rff.getFormSubmissionEndTime(formstate) && (rff.getFormSubmissionError(formstate) || rff.getFormSubmissionAsyncErrorModelKeys(formstate)) && !rff.getFormCustomProperty(formstate, 'errorAcknowledged')}
        lastSubmitFailed={rff.isFormSubmittedAndUnchanged(formstate) && (!rff.getFormSubmissionValidity(formstate) || rff.getFormSubmissionError(formstate))}
        ref={submitRef}
        message={submitMessage}
      />
    </Form>
  );
}




export function FormSuccessFeedback({success}) {

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (success) {
      setShowModal(true);
    }
  }, [success]);

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      centered
    >
      <Modal.Header closeButton className='submit-success'>
        <Modal.Title>Successful Submit!</Modal.Title>
      </Modal.Header>
    </Modal>
  );
}




export function driveFormSubmission(form, submitValidModel) {
  form.setFormstate((formstate) => {
    if (rff.isFormSubmitting(formstate)) {return formstate;}

    formstate = rff.startFormSubmission(formstate);
    formstate = rff.synclyValidateForm(formstate, form);

    if (!form.runAsyncIfInvalid && rff.isModelInvalid(formstate)) {
      return rff.cancelFormSubmission(formstate);
    }

    formstate = rff.asynclyValidateForm(formstate, form);

    Promise.all(rff.getPromises(formstate)).then(() => {

      form.setFormstate((validatedFs) => {

        if (rff.isFormAsyncError(validatedFs)) {
          return rff.cancelFormSubmissionKeepInputDisabled(validatedFs);
        }

        if (!rff.isModelValid(validatedFs)) {
          return rff.cancelFormSubmission(validatedFs);
        }

        submitValidModel(validatedFs.model);

        return validatedFs;
      });
    });

    return formstate;
  });
}




export function submitValidModel(form, validModel, promise = null) {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      window.setTimeout(() => resolve(), 2000);
    });
  }

  promise.then(() => {
    form.setFormstate((fs) => rff.cancelFormSubmission(fs));
  }).catch((err) => {
    form.setFormstate((fs) => {
      fs = rff.setFormSubmissionError(fs, err);
      return rff.cancelFormSubmissionKeepInputDisabled(fs);
    });
  });
}





export default function DemoFormContainer({formstate, form, children}) {

  const submitHistory = rff.getFormSubmissionHistory(formstate);

  const formStatus = {
    waiting: rff.isFormWaiting(formstate),
    inputDisabled: rff.isInputDisabled(formstate),
    submit: {...formstate.formStatus.submit},
    isModelValid: rff.isModelValid(formstate),
    isModelInvalid: rff.isModelInvalid(formstate),
    isPrimedModelInvalid: rff.isPrimedModelInvalid(formstate, form.calculatePrimed),
    custom: formstate.formStatus.custom,
    submitHistory: submitHistory.map((fs,i) => `formstate${submitHistory.length - i}`)
  };

  const submissionError = rff.getFormSubmissionError(formstate);
  if (submissionError) {
    formStatus.submit.submissionError = submissionError.message;
  }

  const fieldStatuses = [], scopeStatuses = [];

  Object.keys(formstate.statuses).forEach(id => {

    const modelKey = rff.getModelKey(formstate, id); // since this is top-level formstate, modelKey/rootModelKey, same difference
    const fullStatus = formstate.statuses[id];

    const trimmedStatus = {modelKey};
    if (!rff.isScope(formstate, id) && fullStatus.initialValue) {trimmedStatus.initialValue = fullStatus.initialValue;}
    trimmedStatus.synclyValid = fullStatus.synclyValid;
    if (Object.keys(fullStatus.async).length > 0) {
      trimmedStatus.async = {...fullStatus.async};
      if (trimmedStatus.async.error) {
        trimmedStatus.async.error = trimmedStatus.async.error.message;
      }
    }
    if (Object.keys(fullStatus.touched).length > 0) {trimmedStatus.touched = fullStatus.touched;}
    if (fullStatus.message) {trimmedStatus.message = fullStatus.message;}
    if (Object.keys(fullStatus.custom).length > 0) {trimmedStatus.custom = fullStatus.custom;}

    if (rff.isScope(formstate, id)) {
      scopeStatuses.push(trimmedStatus);
    }
    else {
      fieldStatuses.push(trimmedStatus);
    }
  });

  return (
    <Container fluid>
      <Row>
        <Col xs={12} md={4} style={{marginBottom: '20px'}}>
          {children}
        </Col>
        <Col xs={12} md={4} style={{marginBottom: '20px'}}>
          <h3>Field Status</h3>
          <Card>
            <Card.Body>
              <pre>
                {JSON.stringify(fieldStatuses, jsonUndefinedReplacer, 2)}
              </pre>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4} style={{marginBottom: '20px'}}>
          <h3>Model</h3>
          <Card>
            <Card.Body>
              <pre>
                {JSON.stringify(formstate.model, jsonUndefinedReplacer, 2)}
              </pre>
            </Card.Body>
          </Card>
          <br/>
          <h3>Form Status</h3>
          <Card>
            <Card.Body>
              <pre>
                {JSON.stringify(formStatus, jsonUndefinedReplacer, 2)}
              </pre>
            </Card.Body>
          </Card>
          <br/>
          <h3>Scope Status</h3>
          <Card>
            <Card.Body>
              <pre>
                {JSON.stringify(scopeStatuses, jsonUndefinedReplacer, 2)}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}



const jsonUndefinedReplacer = (k, v) => (
  v === undefined ? "(undefined)" : v
);
