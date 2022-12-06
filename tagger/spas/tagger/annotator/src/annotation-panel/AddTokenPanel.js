import { useState } from 'react';

import { Button, ButtonGroup, Form } from 'react-bootstrap';

import { VALID_TOKEN_REGEX } from '../settings';

export default (props) => {
  const [token, setToken] = useState("");

  const onTokenChange = (e) => {
    const value = e.target.value;
    if (VALID_TOKEN_REGEX.test(value))
      setToken(value);
  };

  return (
    <>
      <h1 className="h5">Add a token</h1>
      <Form.Control type="text" size="sm" value={token}
        onChange={onTokenChange} disabled={props.disabled} />
      <Form.Text>Insert relative to current:</Form.Text>
      <div>
        <ButtonGroup>
          <Button size="sm" variant="outline-primary"
            onClick={e => {
              props.insertBeforeCurrentCallback(token);
              setToken("");
            }}
            disabled={props.disabled || token === ""}>
            <i className="fa-solid fa-arrow-left"></i> Before
          </Button>
          <Button size="sm" variant="outline-primary"
            onClick={e => {
              props.insertAfterCurrentCallback(token);
              setToken("");
            }}
            disabled={props.disabled || token === ""}>
            After <i className="fa-solid fa-arrow-right"></i>
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
};
