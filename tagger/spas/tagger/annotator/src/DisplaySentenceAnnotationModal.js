import { Button, Modal } from "react-bootstrap";

import { AnnotatedTokenBadge } from "./annotation-panel/SentenceDisplayPanel";

export default (props) => {
  const handleClose = () => props.setShow(false);

  return (
    <Modal show={props.show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>View Annotation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2 className="h5">Raw Sentence</h2>
        <p>{props.raw}</p>
        <h2 className="h5">Annotation</h2>
        {props.annotation?.map(({tag, token}) =>
          <AnnotatedTokenBadge tag={tag} token={token}
            className="me-1 mb-1"/> )}
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="outline-secondary"
          onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
