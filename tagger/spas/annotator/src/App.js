import { useState } from 'react';

import axios from 'axios';

import { Badge, Button, ButtonGroup, Col, Form, Row, Table } from 'react-bootstrap';

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
  const [sentence, setSentence] = useState("");

  const onStartClick = e => {
    let tokens;
    const tokenizeRequest = async () => {
      const response = await axios.get(
        `/tokenize/`, { params: { sentence: sentence } });
      tokens = response.data.tokens;
    };

    tokenizeRequest().then(() => {
      props.initializeCallback(tokens);
    });
  };

  // TODO: Don't allow to proceed when sentence is improper/empty.
  return (
    <div className={props.className}>
      <h1 className="h5">Input sentence to annotate</h1>
      <Form.Control as="textarea" rows={3} value={sentence}
        onChange={event => setSentence(event.target.value)}
        disabled={props.isAnnotating} className="mb-2"></Form.Control>
      <Button size="sm" variant="outline-primary" onClick={onStartClick}
        disabled={props.isAnnotating}>
        <i className="fa-solid fa-marker"></i> Start annotating
      </Button>
    </div>
  );
};

const SentenceAnnotationPanel = (props) => {
  return (
    <Row className={props.className}>
      <Col md={8}>
        <Row className="mb-3">
          <Col xs={8} className="border-end">
            <SentenceDisplayPanel tokens={props.tokens}
              highlightIndex={props.annotateIndex} />
          </Col>
          <Col xs={4}>
            <AddTokenPanel />
          </Col>
        </Row>
        <Row className="pt-3 border-top mb-3">
          <Col xs={4} className="border-end">
            <EditTokenPanel />
          </Col>
          <Col xs={8}>
            <TagButtonsPanel annotateCallback={props.annotateCallback} />
          </Col>
        </Row>
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

const SentenceDisplayPanel = (props) => {
  return (
    <>
      <h1 className="h5">Your sentence</h1>
      <div className="mb-3">
        {props.tokens?.map(({ token, tag }, index) => {
          if (tag) {
            if (props.highlightIndex === index)
              return <span className="border-bottom border-primary border-2
              pb-1 me-1 mb-1">
                <AnnotatedTokenBadge key={index}
                  tag={tag} token={token}
                  className="me-1 mb-1" />
              </span>;

            else
              return <AnnotatedTokenBadge key={index}
                tag={tag} token={token}
                className="me-1 mb-1" />;
          }
          else
            return <span key={index} className={`me-1 mb-1
              ${props.highlightIndex === index ?
                'border-bottom border-primary border-2 pb-1' : null}`}>
              {token}
            </span>;
        })}
      </div>
      <Form.Text>
        <i className="fa-solid fa-exclamation-circle"></i>
        Tip: Click on a token to revisit it.
      </Form.Text>
    </>
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

const AddTokenPanel = (props) => {
  const [token, setToken] = useState("");

  return (
    <>
      <h1 className="h5">Add a token</h1>
      <Form.Control type="text" size="sm" value={token}
        onChange={e => setToken(e.target.value)} />
      <Form.Text>Insert relative to current:</Form.Text>
      <div>
        <ButtonGroup>
          <Button size="sm" variant="outline-primary">
            <i className="fa-solid fa-arrow-left"></i> Before
          </Button>
          <Button size="sm" variant="outline-primary">
            After <i className="fa-solid fa-arrow-right"></i>
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
};

const EditTokenPanel = (props) => {
  const [token, setToken] = useState("");

  return (
    <>
      <h1 className="h5">Current token</h1>
      <Form.Control type="text" size="sm" value={token}
        onChange={e => setToken(e.target.value)} />
      <Form.Text>Change as necessary, or delete below.</Form.Text>
      <div>
        <Button size="sm" variant="outline-danger">
          <i className="fa-solid fa-trash"></i> Remove token
        </Button>
      </div>
    </>
  );
};

const TagButtonsPanel = (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Annotate current token as</h1>
      {POS_TAGS.map(({ tag, verbose }) =>
        <button key={tag} type="button"
          className={`btn btn-sm btn-pos-${tag.toLowerCase()} me-1 mb-1`}
          onClick={e => props.annotateCallback(tag)}>
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

const App = () => {
  const [isAnnotating, setAnnotating] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [annotateIndex, setAnnotateIndex] = useState(-1);

  const initializeWithTokens = (tokens) => {
    setAnnotating(true);
    setAnnotateIndex(0);
    setTokens(tokens.map((token) => { return { token, tag: null }; }));
  };

  const annotateCurrentWithTag = (tag) => {
    let newTokens = [...tokens];
    newTokens[annotateIndex].tag = tag;
    setTokens(newTokens);
    setAnnotateIndex(annotateIndex + 1);
  };

  return (
    <>
      <InputSentenceForm className="border-top pt-3 mb-3"
        isAnnotating={isAnnotating} initializeCallback={initializeWithTokens} />
      {isAnnotating ?
        <SentenceAnnotationPanel className="border-top pt-3"
          tokens={tokens} annotateIndex={annotateIndex}
          annotateCallback={annotateCurrentWithTag} /> : null}
    </>
  );
};

export default App;
