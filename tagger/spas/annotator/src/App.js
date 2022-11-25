import { Badge, Button, Col, Form, Row, Table } from 'react-bootstrap';

const POS_TAGS = [
  { tag: "ADJ", verbose: "Adjective" },
  { tag: "ADV", verbose: "Adverb" },
  { tag: "INTJ", verbose: "Interjection" },
  { tag: "NOUN", verbose: "Noun" },
  { tag: "PROPN", verbose: "Proper Noun" },
  { tag: "ADP", verbose: "Adposition" },
  { tag: "AUX", verbose: "Auxiliary" },
  { tag: "CCONJ", verbose: "Coordinating Conjunction" },
  { tag: "DET", verbose: "Determiner" },
  { tag: "NUM", verbose: "Numeral" },
  { tag: "PART", verbose: "Particle" },
  { tag: "PRON", verbose: "Pronoun" },
  { tag: "SCONJ", verbose: "Subordinating Conjunction" },
  { tag: "PUNCT", verbose: "Punctuation" },
  { tag: "SYM", verbose: "Symbol" },
  { tag: "X", verbose: "Other" }];

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
          {POS_TAGS.map(({ tag }) =>
            <AnnotatedTokenBadge key={tag} tag={tag} token={"Hello"}
              className="me-1 mb-1" />)}
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
      {POS_TAGS.map(({ tag, verbose }) =>
        <button key={tag} type="button"
          className={`btn btn-sm btn-pos-${tag.toLowerCase()} me-1 mb-1`}>
          {verbose} | {tag}
        </button>)}
    </div>
  );
};

const SummaryTable = () => {
  return (
    <Table striped hover size="sm">
      <tbody>
        <tr><th colSpan="2" className="text-center">Overall</th></tr>
        <tr><td># of tokens</td><td>5</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag</th></tr>
        {POS_TAGS.map(({ tag }) =>
          <tr key={tag}><td>{tag}</td><td>0</td></tr>)}
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
