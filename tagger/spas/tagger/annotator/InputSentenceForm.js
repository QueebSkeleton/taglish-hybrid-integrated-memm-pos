import { useState } from 'react';

import { Button, Form } from 'react-bootstrap';

export default (props) => {
  const [language, setLanguage] = useState("TAGLISH");
  const [sentence, setSentence] = useState("");

  return (
    <div className={props.className}>
      <h1 className="h5">Input sentence to annotate</h1>
      <div className="mb-3">
        <Form.Label>Language</Form.Label>
        <Form.Select size="sm" value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={props.disabled}>
          <option value="TAGLISH">Taglish</option>
          <option value="ENG">English</option>
          <option value="FIL">Tagalog</option>
        </Form.Select>
      </div>
      <Form.Control as="textarea" rows={3} value={sentence}
        onChange={event => setSentence(event.target.value)}
        disabled={props.disabled} className="mb-2" />
      <Button size="sm" variant="outline-primary"
        onClick={e => props.initializeCallback({ language, raw: sentence })}
        disabled={props.disabled || !language || !sentence}>
        <i className="fa-solid fa-marker"></i> Start annotating
      </Button>
    </div>
  );
};
