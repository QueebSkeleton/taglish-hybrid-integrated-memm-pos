import { useEffect, useState } from 'react';

import axios from 'axios';

import { Badge, Button, ButtonGroup, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";

import ViewSentenceAnnotationModal from './ViewSentenceAnnotationModal';

export default (props) => {
  const [sentences, setSentences] = useState([]);

  // Internal refresh
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [showViewModal, setShowViewModal] = useState(false);
  const [sentenceIndexToShow, setSentenceIndexToShow] = useState(null);
  const [annotationToShow, setAnnotationToShow] = useState(null);

  // Search and pagination state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    const params = { page: currentPage };
    if (search)
      params.q = search;
    const response = await axios.get(`/api/sentences/`, { params });
    setSentences(response.data.results);
    setTotalPages(response.data.total_pages);
  };

  const onViewClick = (index) => {
    return () => {
      const fetchAnnotation = async () => {
        const response =
          await axios.get(`/annotated-sentence/${sentences[index].id}/`);
        return response.data.annotation;
      };
      fetchAnnotation().then((data) => {
        setSentenceIndexToShow(index);
        setAnnotationToShow(data);
        setShowViewModal(true);
      });
    };
  };

  const onValidateClick = (index) => {
    const validateAnnotation = async () => {
      await axios.post(`/api/validate-sentence/`, {id: sentences[index].id});
      setRefreshCounter(refreshCounter + 1);
    };
    validateAnnotation().then(() => {
      props.setAlertPropsCallback({
        show: true,
        variant: "success",
        heading: "Success.",
        text: `Sentence with ID ${sentences[index].id} has been validated.`
      });
    });
  };

  const onDeleteClick = (index) => {
    return () => {
      if (confirm(`Delete annotation with ID: ${sentences[index].id}?`)) {
        const deleteAnnotation = async () => {
          await axios.delete(`/api/sentences/${sentences[index].id}/`);
          setRefreshCounter(refreshCounter + 1);
        };
        deleteAnnotation().then(() => {
          props.setAlertPropsCallback({
            show: true,
            variant: "success",
            heading: "Success.",
            text: `Sentence with ID ${sentences[index].id} has been removed.`
          });
        });
      }
    };
  };

  const onPageChange = (event) => {
    setCurrentPage(event.selected + 1);
  };

  useEffect(() => {
    fetchData();
  }, [search, currentPage, refreshCounter, props.refreshCounter]);


  return (
    <div className={props.className}>
      <Row>
        <Col sm={6} md={8}>
          <h1 className="h5">Browse dataset</h1>
        </Col>
        <Col sm={6} md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fa-solid fa-search"></i>
            </InputGroup.Text>
            <Form.Control type="text" size="sm" value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search dataset by identifier..." />
          </InputGroup>
        </Col>
      </Row>
      <Table responsive size="sm" striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Language</th>
            <th>Sentence</th>
            <th>Is Validated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map(({ id, language, raw, is_validated }, index) => {
            return (<tr key={id}>
              <td>{id}</td>
              <td>{language}</td>
              <td>{raw}</td>
              <td>
                {is_validated ? <Badge bg="success">Yes</Badge> : <Badge bg="warning">No</Badge>}
              </td>
              <td>
                <ButtonGroup size="sm">
                  <Button variant="outline-info"
                    onClick={onViewClick(index)}>
                    <i className="fa-solid fa-eye"></i>
                  </Button>
                  <Button variant="outline-primary"
                    onClick={() => props.editCallback(id)}>
                    <i className="fa-solid fa-edit"></i>
                  </Button>
                  <Button variant="outline-danger"
                    onClick={onDeleteClick(index)}>
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </ButtonGroup>
              </td>
            </tr>);})}
        </tbody>
      </Table>
      <Row>
        <Col sm={4}>
          <a href="/dataset-csv/" target="_blank"
            className="btn btn-sm btn-primary">
            <i className="fa-solid fa-file-csv"></i> Download Dataset CSV
          </a>
        </Col>
        <Col sm={8} className="text-end">
          <ReactPaginate
            pageCount={totalPages}
            onPageChange={onPageChange}
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active" />
        </Col>
      </Row>
      <ViewSentenceAnnotationModal show={showViewModal} setShow={setShowViewModal}
        validateCallback={onValidateClick} sentenceIndexToShow={sentenceIndexToShow}
        sentenceToShow={sentenceIndexToShow ? sentences[sentenceIndexToShow] : null}
        annotationToShow={annotationToShow} />
    </div>
  );
};
