import React from 'react';
import Form from 'react-bootstrap/Form';

export default function Select(props) {

  const {
    optionValues,
    multiple,
    value,
    ...other
  } = props;

  // placeholder={placeholder}
  // onChange={onChange}
  // onBlur={onBlur}
  // size={size}

  return (
    <Form.Control
      as="select"
      multiple={multiple}
      value={multiple ? (value || []) : value}
      {...other}
    >
      {optionValues.map((v) => <option key={v.id} value={v.id.toString()}>{v.name || v.text}</option>)}
    </Form.Control>
  );
}

Select.getSelectMultipleValue = (e) => {
  const value = [], options = e.target.options;
  for (let i = 0, len = options.length; i < len; i++) {
    if (options[i].selected) {
      value.push(options[i].value);
    }
  }
  return value;
}
