import { Button, Modal } from "react-bootstrap";

import { AnnotatedTokenBadge } from "../annotation-panel/SentenceDisplayPanel";

export default (props) => {
  const handleClose = () => props.setShow(false);

  return (
    <Modal show={props.show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>View Annotation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2 className="h5">Raw Sentence</h2>
        <p>{props.sentenceToShow?.raw}</p>
        <h2 className="h5">Annotation</h2>
        {props.annotationToShow?.map(({ tag, token }) =>
          <AnnotatedTokenBadge key={tag + token} tag={tag} token={token}
            className="me-1 mb-1" />)}
      </Modal.Body>
      <Modal.Footer>
        {!(props.sentenceToShow?.is_validated) ?
          <Button size="sm" variant="success"
            onClick={() => {props.validateCallback(props.sentenceIndexToShow); handleClose();}}>
            <i className="fa-solid fa-check"></i> Validate
          </Button> : null}
        <Button size="sm" variant="outline-secondary"
          onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
