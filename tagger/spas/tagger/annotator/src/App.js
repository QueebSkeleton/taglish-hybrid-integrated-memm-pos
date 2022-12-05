import { useState } from 'react';

import axios from 'axios';

import { Badge, Button, ButtonGroup, Col, Form, Row, Table } from 'react-bootstrap';


const POS_TAGS = [
  { tag: "ADJ", verbose: "Adjective" },
  { tag: "ADV", verbose: "Adverb" },
  { tag: "INTJ", verbose: "Interjection" },
  { tag: "NOUN", verbose: "Noun" },
  { tag: "PROPN", verbose: "Proper Noun" },
  { tag: "VERB", verbose: "Verb" },
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

const VALID_TOKEN_REGEX = /^\S+$/;

const InputSentenceForm = (props) => {
  const [id, setId] = useState("");
  const [language, setLanguage] = useState("TAGLISH");
  const [sentence, setSentence] = useState("");

  // TODO: Don't allow to proceed when sentence is improper/empty.
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

const SentenceAnnotationPanel = (props) => {
  return (
    <Row className={props.className}>
      <Col md={8}>
        <Row className="mb-3">
          <Col xs={8} className="border-end">
            <SentenceDisplayPanel tokens={props.tokens}
              annotateIndex={props.annotateIndex}
              setAnnotateIndex={props.setAnnotateIndex} />
          </Col>
          <Col xs={4}>
            <AddTokenPanel
              insertBeforeCurrentCallback={props.insertBeforeCurrentCallback}
              insertAfterCurrentCallback={props.insertAfterCurrentCallback}
              disabled={props.annotateIndex >= props.tokens.length} />
          </Col>
        </Row>
        <Row className="pt-3 border-top mb-3">
          <Col xs={4} className="border-end">
            <EditTokenPanel
              currentToken={props.annotateIndex < props.tokens.length ?
                props.tokens[props.annotateIndex].token : ""}
              disabled={props.annotateIndex >= props.tokens.length}
              removeDisabled={props.tokens.length === 1}
              editCurrentTokenCallback={props.editCurrentTokenCallback}
              removeCurrentTokenCallback={props.removeCurrentTokenCallback} />
          </Col>
          <Col xs={8}>
            <TagButtonsPanel disabled={props.annotateIndex >= props.tokens.length}
              annotateCallback={props.annotateCallback} />
          </Col>
        </Row>
        <div className="border-top pt-3">
          <Button size="sm" variant="outline-primary"
            onClick={props.submitCallback}
            disabled={!props.canSubmit}>
            <i className="fa-solid fa-hand-point-up"></i> Submit to session
          </Button>
        </div>
      </Col>
      <Col md={4}>
        <SummaryTable tokens={props.tokens} tagsSummary={props.tagsSummary} />
      </Col>
    </Row>
  );
};

const SentenceDisplayPanel = (props) => {
  const onTokenClick = (index) => {
    props.setAnnotateIndex(index);
  };

  return (
    <>
      <h1 className="h5">Your sentence</h1>
      <div className="mb-3">
        {props.tokens?.map(({ token, tag }, index) => {
          if (tag) {
            if (props.annotateIndex === index)
              return <span key={index}
                className="border-bottom border-primary
                  border-2 pb-1 me-1 mb-1"
                onClick={() => onTokenClick(index)}>
                <AnnotatedTokenBadge tag={tag} token={token} />
              </span>;

            else
              return <AnnotatedTokenBadge key={index}
                onClick={() => onTokenClick(index)}
                tag={tag} token={token} className="me-1 mb-1" />;
          }
          else
            return <span key={index} className={`me-1 mb-1
              ${props.annotateIndex === index ?
                'border-bottom border-primary border-2 pb-1' : null}`}
              onClick={() => onTokenClick(index)}>
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
      className={props.className}
      onClick={props.onClick}>
      {props.token} | {props.tag}
    </Badge>
  );
};

const AddTokenPanel = (props) => {
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

const EditTokenPanel = (props) => {
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

const TagButtonsPanel = (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Annotate current token as</h1>
      {POS_TAGS.map(({ tag, verbose }) =>
        <button key={tag} type="button"
          className={`btn btn-sm btn-pos-${tag.toLowerCase()} me-1 mb-1`}
          onClick={e => props.annotateCallback(tag)}
          disabled={props.disabled}>
          {verbose} | {tag}
        </button>)}
    </div>
  );
};

const SummaryTable = (props) => {
  return (
    <Table striped hover size="sm">
      <tbody>
        <tr><th colSpan="2" className="text-center">Overall</th></tr>
        <tr><td># of tokens</td><td>{props.tokens.length}</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag</th></tr>
        {Object.entries(props.tagsSummary).map(([tag, count]) =>
          <tr key={tag}><td>{tag}</td><td>{count}</td></tr>)}
      </tbody>
    </Table>
  );
};

const App = () => {
  // Input details
  const [sentenceInput, setSentenceInput] = useState({
    id: null, raw: null, language: null
  });
  // Flag if the form should display the annotation form or not.
  const [isAnnotating, setAnnotating] = useState(false);
  // Current tokens with their tags.
  const [tokens, setTokens] = useState(null);
  // Summary of sentence currently being annotated
  const [tagsSummary, setTagsSummary] = useState({});
  // Current token in "tokens" state being annotated.
  const [annotateIndex, setAnnotateIndex] = useState(-1);
  // Flag if the current sentence can be submitted now (submit button disabled?)
  // Only true if all tokens are annotated.
  const [canSubmit, setCanSubmit] = useState(false);

  // Initializes to annotation mode with the inputted sentence
  const initializeWithSentence = (sentenceInput) => {
    setSentenceInput(sentenceInput);
    const tokenizeThenInitialize = async () => {
      // Hit API to tokenize the sentence, get response
      const response = await axios.get(
        `/tokenize/`, { params: { sentence: sentenceInput.raw } });
      // TODO: Handle HTTP error codes!
      setTokens(response.data.tokens.map((token) => ({ token, tag: null })));
      setAnnotating(true);
      setAnnotateIndex(0);

      // Initialize tags summary
      let tagsSummary = {};
      for(const {tag, verbose} of POS_TAGS)
        tagsSummary[tag] = 0;
      setTagsSummary(tagsSummary);
    };

    tokenizeThenInitialize();
  };

  // Annotate the token at annotateIndex with the given tag.
  const annotateCurrentWithTag = (tag) => {
    // Update tags summary with new annotated tag
    let newTagsSummary = {...tagsSummary};
    // If there was a tag replaced, reduce its count
    if(tokens[annotateIndex].tag)
      newTagsSummary[tokens[annotateIndex].tag] -= 1;
    // Update token with new tag
    let newTokens = [...tokens];
    newTokens[annotateIndex].tag = tag;
    setTokens(newTokens);

    newTagsSummary[tag] += 1;
    setTagsSummary(newTagsSummary);

    setAnnotateIndex(annotateIndex + 1);

    // Check if annotation can be submitted
    // by finding an unannotated token. If there is, set flag to false
    const unannotatedToken = newTokens.find(
      (tokenAnnotation) => !Boolean(tokenAnnotation.tag));
    if (unannotatedToken) setCanSubmit(false);
    else setCanSubmit(true);
  };

  // Inserts a new token at the specified index.
  const insertTokenAtIndex = (token, index) => {
    let newTokens = [...tokens];
    newTokens.splice(index, 0, { token, tag: null });
    setTokens(newTokens);
    setAnnotateIndex(index);
    setCanSubmit(false);
  };

  // Edits token at specified index.
  const editTokenAtIndex = (token, index) => {
    let newTokens = [...tokens];
    newTokens[index].token = token;
    setTokens(newTokens);
  };

  // Removes token at specified index.
  const removeTokenAtIndex = (index) => {
    let newTokens = [...tokens];
    newTokens.splice(index, 1);
    setTokens(newTokens);

    let newTagsSummary = {...tagsSummary};
    newTagsSummary[tokens[index].tag] -= 1;
    setTagsSummary(newTagsSummary);
  };

  // Submits the annotated sentence to session.
  const onSubmitClick = (e) => {
    const submitRequest = async () => {
      await axios.post('/save-to-session/', {
        ...sentenceInput,
        annotated: tokens.reduce((annotated, token) =>
          annotated + `<${token.tag} ${token.token}> `, "").trim()
      });
    };

    submitRequest().then(() => { window.location.reload(); });
  };

  return (
    <>
      <InputSentenceForm className="border-top pt-3 mb-3"
        initializeCallback={initializeWithSentence}
        disabled={isAnnotating} />
      {isAnnotating ?
        <SentenceAnnotationPanel className="border-top pt-3"
          tokens={tokens} tagsSummary={tagsSummary}
          annotateIndex={annotateIndex} setAnnotateIndex={setAnnotateIndex}
          annotateCallback={annotateCurrentWithTag}
          insertBeforeCurrentCallback={
            (token) => insertTokenAtIndex(token, annotateIndex)}
          insertAfterCurrentCallback={
            (token) => insertTokenAtIndex(token, annotateIndex + 1)}
          editCurrentTokenCallback={
            (token) => editTokenAtIndex(token, annotateIndex)}
          removeCurrentTokenCallback={
            () => removeTokenAtIndex(annotateIndex)}
          canSubmit={canSubmit}
          submitCallback={onSubmitClick} /> : null}
    </>
  );
};

export default App;
