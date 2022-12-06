import { useState, useEffect } from "react";

import axios from "axios";

import { Badge, Button, Table } from 'react-bootstrap';
import DisplaySentenceAnnotationModal from "./DisplaySentenceAnnotationModal";

export default (props) => {
  const [sentences, setSentences] = useState([]);
  // Dependency counter flag
  const [refreshCounter, setRefreshCounter] = useState(0);
  // Modal show
  const [rawToShow, setRawToShow] = useState(null);
  const [annotationToShow, setAnnotationToShow] = useState(null);
  const [viewModalShow, setViewModalShow] = useState(false);

  const fetchSessionSentences = async () => {
    const { data } = await axios.get(`/session-sentences/`);
    setSentences(data);
  };

  const clearSessionSentences = async () => {
    await axios.get(`/session-sentences/clear/`);
    // TODO: Handle error responses
  };

  const onClearClick = () => {
    if (confirm("Clear your session sentences?"
      + " This action will not remove them from the database.")) {
      clearSessionSentences();
      setRefreshCounter(refreshCounter + 1);
    }
  };

  const onViewClick = (index) => {
    return () => {
      const fetchAnnotation = async () => {
        const response =
          await axios.get(`/annotated-sentence/${sentences[index].id}`);
        return response.data.annotation;
      };
      fetchAnnotation().then((data) => {
        setAnnotationToShow(data);
        setRawToShow(sentences[index].raw);
        setViewModalShow(true);
      });
    };
  };

  useEffect(() => {
    fetchSessionSentences();
  }, [refreshCounter]);

  return (
    <>
      <h1 className="h5">Your session history</h1>
      <Table responsive size="sm" striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Language</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sentences.length > 0 ?
            sentences.map((sentence, index) =>
              <tr key={sentence.id}>
                <td>{sentence.id}</td>
                <td>{sentence.language}</td>
                <td>
                  <Button size="sm" variant="outline-primary"
                    onClick={onViewClick(index)}>
                    <i className="fa-solid fa-eye"></i>
                  </Button>
                </td>
              </tr>) :
            <tr>
              <td colSpan="3" className="text-center">
                No sentences yet.
              </td>
            </tr>}
        </tbody>
      </Table>
      <Button size="sm" variant="outline-secondary"
        onClick={onClearClick}>
        <i className="fa-solid fa-trash"></i> Clear Session
      </Button>
      <a href="/session-sentences/csv/" target="_blank"
        className="btn btn-sm btn-primary ms-2">
        <i className="fa-solid fa-file-csv"></i> Download as CSV
        &nbsp;<Badge bg="secondary">{sentences.length}</Badge>
      </a>
      {/* Modal */}
      <DisplaySentenceAnnotationModal show={viewModalShow}
        setShow={setViewModalShow}
        raw={rawToShow} annotation={annotationToShow} />
    </>
  );
};
