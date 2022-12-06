import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';

export default (props) => {
  const [id, setId] = useState("");
  const [language, setLanguage] = useState("TAGLISH");
  const [sentence, setSentence] = useState("");

  return (
    <div className={props.className}>
      <h1 className="h5">Input sentence to annotate</h1>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>ID</Form.Label>
          <Form.Control type="text" size="sm" value={id}
            onChange={e => setId(e.target.value)}
            disabled={props.disabled} />
        </Col>
        <Col md={6}>
          <Form.Label>Language</Form.Label>
          <Form.Select size="sm" value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={props.disabled}>
            <option value="TAGLISH">Taglish</option>
            <option value="ENG">English</option>
            <option value="FIL">Tagalog</option>
          </Form.Select>
        </Col>
      </Row>
      <Form.Control as="textarea" rows={3} value={sentence}
        onChange={event => setSentence(event.target.value)}
        disabled={props.disabled} className="mb-2"></Form.Control>
      <Button size="sm" variant="outline-primary"
        onClick={e => props.initializeCallback({ id, language, raw: sentence })}
        disabled={props.disabled || !id || !language || !sentence}>
        <i className="fa-solid fa-marker"></i> Start annotating
      </Button>
    </div>
  );
};
