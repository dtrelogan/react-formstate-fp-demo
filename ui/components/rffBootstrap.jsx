import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { rff } from 'react-formstate-fp';
import BootstrapSelect from './Select.jsx';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import DatePicker from "react-datepicker";


export function calculatePrimed(formstate, modelKey, whenToPrime = 'onChange', whenToPrimeOnSubmit = 'afterAsync') {
  if (whenToPrime === 'onChange') {return primeOnChange(formstate, modelKey, whenToPrimeOnSubmit);}
  if (whenToPrime === 'onChangeThenBlur') {return primeOnChangeThenBlur(formstate, modelKey, whenToPrimeOnSubmit);}
  if (whenToPrime === 'onBlur') {return primeOnBlur(formstate, modelKey, whenToPrimeOnSubmit);}
  return primeOnSubmit(formstate, modelKey, whenToPrimeOnSubmit);
}

export function primeOnChange(formstate, modelKey, whenToPrimeOnSubmit = 'afterAsync') {
  return primeOnSubmit(formstate, modelKey, whenToPrimeOnSubmit) || rff.isChanged(formstate, modelKey);
}

export function primeOnBlur(formstate, modelKey, whenToPrimeOnSubmit = 'afterAsync') {
  return primeOnSubmit(formstate, modelKey, whenToPrimeOnSubmit) || rff.isBlurred(formstate, modelKey);
}

export function primeOnChangeThenBlur(formstate, modelKey, whenToPrimeOnSubmit = 'afterAsync') {
  return primeOnSubmit(formstate, modelKey, whenToPrimeOnSubmit) || (rff.isChanged(formstate, modelKey) && rff.isBlurred(formstate, modelKey));
}

export function primeOnSubmit(formstate, modelKey, whenToPrimeOnSubmit = 'afterAsync') {
  if (rff.isSubmitted(formstate, modelKey)) {return true;}
  if (rff.isWaiting(formstate, modelKey) || rff.isAsynclyValidated(formstate, modelKey) || rff.getAsyncError(formstate, modelKey)) {return true;}
  // && (whenToPrimeOnSubmit !== 'onCancel' || rff.getAsyncStartTime(formstate, modelKey) < ((rff.isFormSubmitting(formstate) && rff.getFormSubmissionStartTime(formstate)) || Date.now()))
  if (rff.isSubmitting(formstate, modelKey)) {
    if (whenToPrimeOnSubmit === 'onCancel') {return false;}
    if (whenToPrimeOnSubmit === 'immediately') {return true;}
    return !rff.isFormWaiting(formstate);
  }
  return false;
}


function calculateFeedback(formstate, modelKey, form) {
  let feedbackType = null, feedback = null;

  const primed = form.calculatePrimed(formstate, modelKey);

  if (primed && !rff.getCustomProperty(formstate, modelKey, 'suppressFeedback')) {
    if (rff.isValid(formstate, modelKey)) {
      feedbackType = rff.getCustomProperty(formstate, modelKey, 'warn') ? 'warn' : 'valid';
    }
    else if (rff.isInvalid(formstate, modelKey)) {
      feedbackType = 'invalid';
    }
    else if (rff.isWaiting(formstate, modelKey)) {
      feedbackType = 'waiting';
    }
    else if (rff.getAsyncError(formstate, modelKey)) {
      feedbackType = 'error'
    }

    feedback = rff.getMessage(formstate, modelKey);
  }

  return [feedbackType, feedback];
}




export function FormGroup(props) {

  const {
    formstate,
    modelKey,
    form,
    className,
    children,
    ...other
  } = props;

  const id = rff.getId(formstate, modelKey);

  const htmlClass = `${className ? className + ' ' : ''}${rff.isRequired(formstate, id, form) ? 'required' : ''}`;

  return (
    <Form.Group className={htmlClass} controlId={String(id)} {...other}>
      {children}
    </Form.Group>
  );
}




export function Input(props) {

  const {
    formstate,
    modelKey,
    form,
    type,
    handleChange,
    handleBlur,
    ...other
  } = props;

  const id = rff.getId(formstate, modelKey);

  let isValid = false, isInvalid = false;

  const primed = form.calculatePrimed(formstate, modelKey);

  if (primed && !rff.getCustomProperty(formstate, modelKey, 'suppressFeedback')) {
    isValid = rff.isValid(formstate, modelKey);
    isInvalid = rff.isInvalid(formstate, modelKey);
  }

  if (type === 'text' || type === 'password' || type === 'number') {

    // placeholder={placeholder}
    // disabled={disabled}
    // autoFocus={autoFocus}
    // autoComplete={autoComplete}

    return (
      <Form.Control
        type={type}
        name={rff.getRootModelKey(formstate, id)}
        value={rff.getValue(formstate, modelKey)}
        isValid={isValid}
        isInvalid={isInvalid}
        onChange={e => (handleChange || rff.handleChange)(form, e.target.value, id)}
        onBlur={e => (handleBlur || rff.handleBlur)(form, id)}
        {...other}
      />
    );
  }

  if (type === 'select') {

    function onChange(e) {
      let value;
      if (props.multiple) {
        value = BootstrapSelect.getSelectMultipleValue(e);
      }
      else {
        value = e.target.value;
      }
      return (handleChange || rff.handleChange)(form, value, id)
    }

    return (
      <BootstrapSelect
        name={rff.getRootModelKey(formstate, id)}
        value={rff.getValue(formstate, modelKey)}
        isValid={isValid}
        isInvalid={isInvalid}
        onChange={onChange}
        onBlur={e => (handleBlur || rff.handleBlur)(form, id)}
        {...other}
      />
    );
  }

  if (type === 'date') {

    const {className, ...dateOther} = other;

    return (
      <DatePicker
        className={`${className || ''} form-control ${isValid ? 'is-valid' : ''} ${isInvalid ? 'is-invalid' : ''}`}
        selected={rff.getValue(formstate, modelKey)}
        onChange={(v) => (handleChange || rff.handleChange)(form, v, id)}
        {...dateOther}
      />
    );

  }

  return null;
}



export function InputFeedback(props) {

  const {
    formstate,
    modelKey,
    form,
    ...other
  } = props;

  const [feedbackType, feedback] = calculateFeedback(formstate, modelKey, form);

  const fixedFeedback = feedback || <span>&nbsp;</span>;

  if (feedbackType === 'valid' || feedbackType === 'invalid') {
    return (
      <Form.Control.Feedback type={feedbackType} {...other}>
        {fixedFeedback}
      </Form.Control.Feedback>
    );
  }

  let className = 'text-muted';
  if (feedbackType === 'warn') {className = 'text-warning';}
  if (feedbackType === 'error') {className = 'text-danger';}

  return (
    <Form.Text className={className} {...other}>
      {fixedFeedback}
    </Form.Text>
  );
}



export function ScopeFeedback(props) {

  const {
    formstate,
    modelKey,
    form
  } = props;

  const id = rff.getId(formstate, modelKey);

  const [feedbackType, feedback] = calculateFeedback(formstate, modelKey, form);

  // const fixedFeedback = feedback || <span>&nbsp;</span>;

  let className = 'text-muted';
  if (feedbackType === 'valid') {className = 'text-success';}
  if (feedbackType === 'invalid' || feedbackType === 'error') {className = 'text-danger';}
  if (feedbackType === 'warn') {className = 'text-warning';}

  return (
    <Form.Group controlId={String(id)}>
      <Form.Text className={className}>
        {feedback}
      </Form.Text>
    </Form.Group>
  );
}



export function FormSubmissionErrorFeedback({formstate, form}) {

  let duringAsync = false;
  let error = rff.getFormSubmissionEndTime(formstate) && rff.getFormSubmissionError(formstate);

  if (!error) {
    duringAsync = true;
    error = rff.getFormSubmissionEndTime(formstate) && rff.getFormSubmissionAsyncErrorModelKeys(formstate);
  }

  useEffect(() => {
    if (error) {
      form.setFormstate(fs => rff.setFormCustomProperty(fs, 'errorAcknowledged', false));
    }
  }, [error]);

  let errorMessage = null;

  if (error) {
    if (duringAsync) {
      const firstModelKey = error[0]; // Only showing the first error if there is more than one.
      const submitSnapshot = rff.getFormSubmissionHistory(formstate)[0];
      const asyncError = rff.getAsyncError(submitSnapshot, firstModelKey);
      errorMessage = `${rff.getMessage(submitSnapshot, firstModelKey)} ${asyncError.message || 'Unknown error.'}`;
    }
    else {
      errorMessage = `An error occured while submitting the form: ${error.message || 'Unknown error.'}`;
    }
  }

  return FormErrorFeedback({
    form,
    heading: 'Submission Error',
    errorMessage,
    acknowledgeError: (fs) => rff.setFormCustomProperty(fs, 'errorAcknowledged', true),
    id: 'submission-error'
  });
}


export function FormValidationErrorFeedback({formstate, modelKey, form}) {

  let error = rff.getAsyncError(formstate, modelKey);

  if (error && rff.wasAsyncErrorDuringSubmit(formstate, modelKey)) {
    error = null;
  }

  useEffect(() => {
    if (error) {
      form.setFormstate(fs => {
        fs = rff.setInputDisabled(fs);
        return rff.setCustomProperty(fs, modelKey, 'errorAcknowledged', false)
      });
    }
  }, [error]);

  let errorMessage = null;

  if (error) {
    errorMessage = `${rff.getMessage(formstate, modelKey)} ${error.message || 'Unknown error.'}`;
  }

  return FormErrorFeedback({
    form,
    heading: 'Validation Error',
    errorMessage,
    acknowledgeError: (fs) => rff.setCustomProperty(fs, modelKey, 'errorAcknowledged', true),
    id: rff.getId(formstate, modelKey)
  });
}


function FormErrorFeedback({form, heading, errorMessage, acknowledgeError, id}) {

  const htmlId = `form-error-feedback-${id}`;

  const [showError, setShowError] = useState(false);

  const alertRef = useRef();

  useEffect(() => {
    if (errorMessage) {
      setShowError(Boolean(errorMessage));
      alertRef.current.focus();
      // window.location.hash = `#${htmlId}`;
    }
  }, [errorMessage]);

  function onClose() {
    setShowError(false);
    form.setFormstate((fs) => {
      fs = acknowledgeError(fs);
      return conditionallyReenableInput(fs, form);
    });
  }

  // <Alert ... transition={Collapse} timeout={750}> doesn't work.
  // react-bootstrap transitions do not seem to work well with animation durations of more than 300 milliseconds.
  // I'm going to revert to css transitions.

  return (
    <div id={htmlId} tabIndex='-1' ref={alertRef} className={`form-error ${showError ? 'open' : 'closed'}`}>
      <Alert variant='danger' onClose={onClose} dismissible transition={null}>
        <Alert.Heading>{heading}</Alert.Heading>
        {errorMessage}
      </Alert>
    </div>
  );
}


function conditionallyReenableInput(fs, form) {
  if ((rff.getFormSubmissionError(fs) || rff.getFormSubmissionAsyncErrorModelKeys(fs)) && !rff.getFormCustomProperty(fs, 'errorAcknowledged')) {
    return fs;
  }
  if (form.acknowledgeAsyncErrors) {
    const modelKeys = rff.getFormAsyncErrorModelKeys(fs);
    if (modelKeys.some(k => !rff.wasAsyncErrorDuringSubmit(fs, k) && !rff.getCustomProperty(fs, k, 'errorAcknowledged'))) {
      return fs;
    }
  }
  return rff.setInputEnabled(fs);
}





function SubmitButton(props, ref) {

  const {
    className,
    variant,
    size,
    message,
    invalid,
    waiting,
    submitting,
    error,
    submitError,
    lastSubmitFailed,
    disabled
  } = props;

  let computedVariant = 'primary', computedMessage = 'Submit';

  if (lastSubmitFailed) {computedVariant = 'warning'; computedMessage = 'Retry submit';}
  if (invalid) {computedVariant = 'danger'; computedMessage = 'Please fix validation errors';}
  if (error) {computedVariant = 'danger'; computedMessage = 'An error occurred';}
  if (submitError) {computedVariant = 'danger'; computedMessage = 'Failed to submit!';}
  if (submitting) {computedVariant = 'info'; computedMessage = 'Submitting...';}
  if (waiting) {computedVariant = 'info'; computedMessage = 'Waiting for form...';}

  if (variant) {computedVariant = variant;}
  if (message) {computedMessage = message;}

  return (
    <div className={className}>
      <Button
        type='submit'
        variant={computedVariant}
        disabled={invalid || submitting || waiting || disabled || submitError || error}
        size={size}
        ref={ref}
      >
        {computedMessage}
      </Button>
    </div>
  );
}

export const Submit = forwardRef(SubmitButton);



export function InputAndFeedback(props) {

  const {
    formstate,
    modelKey,
    form,
    type,
    label,
    formGroupProps,
    labelProps,
    inputProps,
    inputFeedbackProps
  } = props;

  const rffProps = {formstate, modelKey, form};

  //
  // Dealing with react-datepicker eccentricities...
  //

  const input = <Input type={type} {...rffProps} {...inputProps}/>;

  let wrappedInput = input,
    {style: inputFeedbackStyle, ...otherInputFeedbackProps} = (inputFeedbackProps || {});

  if (type === 'date') {
    wrappedInput = <Form.Row>{input}</Form.Row>;
    inputFeedbackStyle = {...(inputFeedbackStyle || {}), display: 'block'}
  }

  //
  // End react-datepicker hacking.
  //

  return (
    <FormGroup {...rffProps} {...formGroupProps}>
      {label ? <Form.Label {...labelProps}>{label}</Form.Label> : null}
      {wrappedInput}
      <InputFeedback {...rffProps} {...otherInputFeedbackProps} style={inputFeedbackStyle}/>
    </FormGroup>
  );
}
