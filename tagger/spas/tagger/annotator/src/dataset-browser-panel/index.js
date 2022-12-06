import { useEffect, useState } from 'react';

import axios from 'axios';

import { Button, ButtonGroup, Col, Form, Row, Table } from "react-bootstrap";

import DisplaySentenceAnnotationModal from "../DisplaySentenceAnnotationModal";

export default (props) => {
  const [search, setSearch] = useState("");
  const [sentences, setSentences] = useState([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [rawToShow, setRawToShow] = useState(null);
  const [annotationToShow, setAnnotationToShow] = useState(null);

  const fetchData = async () => {
    const response = await axios.get(`/api/sentences/`);
    setSentences(response.data.results);
  };

  const onViewClick = (index) => {
    return () => {
      const fetchAnnotation = async () => {
        const response =
          await axios.get(`/annotated-sentence/${sentences[index].id}/`);
        return response.data.annotation;
      };
      fetchAnnotation().then((data) => {
        setRawToShow(sentences[index].raw);
        setAnnotationToShow(data);
        setShowViewModal(true);
      });
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={props.className}>
      <Row>
        <Col sm={6} md={8}>
          <h1 className="h5">Browse dataset</h1>
        </Col>
        <Col sm={6} md={4}>
          <Form.Control type="text" size="sm" value={search}
            onChange={e => setSearch(e.target.value)} />
        </Col>
      </Row>
      <Table responsive size="sm" striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Language</th>
            <th>Last modified by</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map(({ id, language }, index) =>
            <tr key={id}>
              <td>{id}</td>
              <td>{language}</td>
              <td>N/A</td>
              <td>
                <ButtonGroup size="sm">
                  <Button variant="outline-info" onClick={onViewClick(index)}>
                    <i className="fa-solid fa-eye"></i>
                  </Button>
                  <Button variant="outline-primary"
                    onClick={() => props.editCallback(id)}>
                    <i className="fa-solid fa-edit"></i>
                  </Button>
                  <Button variant="outline-danger">
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </ButtonGroup>
              </td>
            </tr>)}
        </tbody>
      </Table>
      <DisplaySentenceAnnotationModal show={showViewModal}
        setShow={setShowViewModal}
        raw={rawToShow} annotation={annotationToShow} />
    </div>
  );
};
