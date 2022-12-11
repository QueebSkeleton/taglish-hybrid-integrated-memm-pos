import { Button, Form } from 'react-bootstrap';

import { VALID_TOKEN_REGEX } from '../settings';

export default (props) => {
  const onTokenChange = e => {
    const value = e.target.value;
    if (VALID_TOKEN_REGEX.test(value))
      props.editCurrentTokenCallback(value);
  };

  return (
    <>
      <h1 className="h5">Current token</h1>
      <Form.Control type="text" size="sm" value={props.currentToken}
        onChange={onTokenChange} disabled={props.disabled} />
      <Form.Text>Change as necessary, or delete below.</Form.Text>
      <div>
        <Button size="sm" variant="outline-danger"
          onClick={e => props.removeCurrentTokenCallback()}
          disabled={props.removeDisabled || props.disabled}>
          <i className="fa-solid fa-trash"></i> Remove token
        </Button>
      </div>
    </>
  );
};
