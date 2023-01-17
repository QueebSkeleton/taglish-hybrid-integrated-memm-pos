import { useState } from "react";

import axios from "axios";

import { initializeTagsSummary } from "../annotator/App";

import { Alert, Badge, Button, Col, Form, Row } from "react-bootstrap";
import SummaryPanel from "../annotator/annotation-panel/SummaryPanel";


const InputSentenceForm = (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Input sentence to annotate</h1>
      <div className="mb-3">
        <Form.Text>
          Place your sentence here. The model will attempt to guess the parts of speech
          of each token!
        </Form.Text>
      </div>
      <Form.Control as="textarea" rows={3} value={props.sentence}
        onChange={event => props.setSentence(event.target.value)}
        className="mb-2" />
      <Button size="sm" variant="outline-primary"
        onClick={props.predictCallback}>
        <i className="fa-solid fa-marker"></i> Predict Tags
      </Button>
    </div>
  );
};

const AnnotatedTokenBadge = (props) => {
  return (
    <Badge bg={`pos-${props.tag.toLowerCase()}`}
      className="fs-6 fw-normal me-1 mb-2">
      {props.token} | {props.tag}
    </Badge>
  );
};

const App = (props) => {
  const [sentence, setSentence] = useState("");
  const [annotatedTokens, setAnnotatedTokens] = useState([]);
  const [annotationSummary, setAnnotationSummary] = useState({});

  const [alertShow, setAlertShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const showResults = () => {
    const fetchAnnotation = async () => {
      const annotationResponse = await axios.get('/online-model/annotate/', {
        params: { sentence }
      });

      if('error' in annotationResponse.data) {
        setAlertShow(true);
        setAlertMessage(annotationResponse.data.error);
        setAnnotatedTokens([]);
        setAnnotationSummary({});
        return;
      }

      const annotation = annotationResponse.data.annotation;
      setAlertShow(false);
      setAlertMessage(null);
      setAnnotatedTokens(annotation);
      setAnnotationSummary(initializeTagsSummary(annotation));
    };

    fetchAnnotation();
  };

  return (
    <>
      <InputSentenceForm sentence={sentence} setSentence={setSentence}
        predictCallback={showResults} className="mb-3" />
      <Alert show={alertShow} variant="danger" dismissible
        onClose={() => setAlertShow(false)}>
        <Alert.Heading>Error</Alert.Heading>
        <p>{alertMessage}</p>
      </Alert>
      <Row className="pt-3 border-top">
        <Col sm={6}>
          <h1 className="h5">Your annotated sentence</h1>
          <div className="mb-3">
            <Form.Text>
              Once you input a sentence, its annotation will be shown here.
            </Form.Text>
          </div>
          <div className="mb-3">
            {annotatedTokens.map(({ tag, token }, index) =>
              <AnnotatedTokenBadge key={index} tag={tag} token={token} />)}
          </div>
        </Col>
        <Col sm={6}>
          <h1 className="h5">Annotation Summary</h1>
          <div className="mb-3">
            <Form.Text>
              The summary of the model's last prediction will be shown here.
            </Form.Text>
          </div>
          <SummaryPanel tokens={annotatedTokens}
            tagsSummary={annotationSummary} />
        </Col>
      </Row>
    </>
  );
};

export default App;
