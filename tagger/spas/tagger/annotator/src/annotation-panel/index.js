import { Button, Col, Row } from 'react-bootstrap';

import SentenceDisplayPanel from './SentenceDisplayPanel';
import AddTokenPanel from './AddTokenPanel';
import EditTokenPanel from './EditTokenPanel';
import TagButtonsPanel from './TagButtonsPanel';
import SummaryPanel from './SummaryPanel';

export default (props) => {
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
        <SummaryPanel tokens={props.tokens} tagsSummary={props.tagsSummary} />
      </Col>
    </Row>
  );
};
