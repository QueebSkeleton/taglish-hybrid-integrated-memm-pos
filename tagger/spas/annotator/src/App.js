import { Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';

const InputSentenceForm = (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Input sentence to annotate</h1>
      <Form.Control as="textarea" rows={3} className="mb-2"></Form.Control>
      <Button size="sm" variant="outline-primary">
        <i className="fa-solid fa-marker"></i> Start annotating
      </Button>
    </div>
  );
};

const SentenceAnnotationPanel = (props) => {
  return (
    <Row className={props.className}>
      <Col md={8}>
        <div className="mb-3">
          <AnnotatedTokenBadge className="me-1 mb-1" tag="ADJ" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="ADV" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="INTJ" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="NOUN" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="PROPN" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="ADP" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="AUX" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="CCONJ" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="DET" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="NUM" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="PART" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="PRON" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="SCONJ" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="PUNCT" token="Hello" />
          <AnnotatedTokenBadge className="me-1 mb-1" tag="SYM" token="Hello" />
        </div>
        <AnnotatorActions className="border-top pt-3 mb-3" />
        <div className="border-top pt-3">
          <Button size="sm" variant="outline-primary">
            <i className="fa-solid fa-hand-point-up"></i> Submit to session
          </Button>
        </div>
      </Col>
      <Col md={4}>
        <SummaryTable />
      </Col>
    </Row>
  );
};

const AnnotatorActions = (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Annotate current token as</h1>
      <button type="button" className="btn btn-sm btn-pos-adj me-1 mb-1">Adjective | ADJ</button>
      <button type="button" className="btn btn-sm btn-pos-adv me-1 mb-1">Adverb | ADV</button>
      <button type="button" className="btn btn-sm btn-pos-intj me-1 mb-1">Interjection | INTJ</button>
      <button type="button" className="btn btn-sm btn-pos-noun me-1 mb-1">Noun | NOUN</button>
      <button type="button" className="btn btn-sm btn-pos-propn me-1 mb-1">Proper Noun | PROPN</button>
      <button type="button" className="btn btn-sm btn-pos-adp me-1 mb-1">Adposition | ADP</button>
      <button type="button" className="btn btn-sm btn-pos-aux me-1 mb-1">Auxiliary | AUX</button>
      <button type="button" className="btn btn-sm btn-pos-cconj me-1 mb-1">Coord. Conjunction | CCONJ</button>
      <button type="button" className="btn btn-sm btn-pos-det me-1 mb-1">Determiner | DET</button>
      <button type="button" className="btn btn-sm btn-pos-num me-1 mb-1">Numeral | NUM</button>
      <button type="button" className="btn btn-sm btn-pos-part me-1 mb-1">Particle | PART</button>
      <button type="button" className="btn btn-sm btn-pos-pron me-1 mb-1">Pronoun | PRON</button>
      <button type="button" className="btn btn-sm btn-pos-sconj me-1 mb-1">Subord. Conjunction | SCONJ</button>
      <button type="button" className="btn btn-sm btn-pos-punct me-1 mb-1">Punctuation | PUNCT</button>
      <button type="button" className="btn btn-sm btn-pos-sym me-1 mb-1">Symbol | SYM</button>
      <button type="button" className="btn btn-sm btn-pos-x me-1 mb-1">Other | X</button>
    </div>
  );
};

const SummaryTable = () => {
  return (
    <Table striped hover size="sm">
      <tbody>
        <tr><th colSpan="2" className="text-center">Overall</th></tr>
        <tr><td># of tokens</td><td>5</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag (Open class)</th></tr>
        <tr><td>ADJ</td><td>0</td></tr>
        <tr><td>ADV</td><td>0</td></tr>
        <tr><td>INTJ</td><td>0</td></tr>
        <tr><td>NOUN</td><td>0</td></tr>
        <tr><td>PROPN</td><td>0</td></tr>
        <tr><td>VERB</td><td>0</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag (Closed class)</th></tr>
        <tr><td>ADP</td><td>0</td></tr>
        <tr><td>AUX</td><td>0</td></tr>
        <tr><td>CCONJ</td><td>0</td></tr>
        <tr><td>DET</td><td>0</td></tr>
        <tr><td>NUM</td><td>0</td></tr>
        <tr><td>PART</td><td>0</td></tr>
        <tr><td>PRON</td><td>0</td></tr>
        <tr><td>SCONJ</td><td>0</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag (Other)</th></tr>
        <tr><td>PUNCT</td><td>0</td></tr>
        <tr><td>SYM</td><td>0</td></tr>
        <tr><td>X</td><td>0</td></tr>
      </tbody>
    </Table>
  );
};

const AnnotatedTokenBadge = (props) => {
  return (
    <Badge bg={`pos-${props.tag.toLowerCase()}`}
      className={props.className}>
      {props.token} | {props.tag}
    </Badge>
  );
};

const App = () => {
  return (
    <>
      <InputSentenceForm className="border-top pt-3 mb-3" />
      <SentenceAnnotationPanel className="border-top pt-3" />
    </>
  );
};

export default App;
