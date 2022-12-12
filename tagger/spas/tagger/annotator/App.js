import { useRef, useState } from 'react';

import axios from 'axios';

import InputSentenceForm from './InputSentenceForm';
import SentenceAnnotationPanel from './annotation-panel';
import DatasetBrowserPanel from './dataset-browser-panel';

import { POS_TAGS } from './settings';
import { Alert } from 'react-bootstrap';

const initializeTagsSummary = (annotation) => {
  let tagsSummary = {};
  for(const {tag} of POS_TAGS)
    tagsSummary[tag] = 0;
  
  // Compute initial summary values with the given annotation
  for(const {token, tag} of annotation)
    if(tag)
      tagsSummary[tag] += 1;
  
  return tagsSummary;
};

export { initializeTagsSummary };

const App = () => {
  // Input details
  const [sentenceInput, setSentenceInput] = useState({
    raw: null, language: null
  });
  // Flag if the form should display the annotation form or not.
  const [isAnnotating, setAnnotating] = useState(false);
  // Flag if this is on add or edit mode.
  // This determines how to hit the API when saving.
  const [isEdit, setEdit] = useState(false);
  // Current tokens with their tags.
  const [tokens, setTokens] = useState(null);
  // Summary of sentence currently being annotated
  const [tagsSummary, setTagsSummary] = useState({});
  // Current token in "tokens" state being annotated.
  const [annotateIndex, setAnnotateIndex] = useState(-1);
  // Flag if the current sentence can be submitted now (submit button disabled?)
  // Only true if all tokens are annotated.
  const [canSubmit, setCanSubmit] = useState(false);
  // Refresh flag for dataset browser component
  const [refreshDatasetCounter, setRefreshDatasetCounter] = useState(0);
  // Refs for scrolling (when annotating and when done)
  const annotationRef = useRef();
  const headerRef = useRef();
  // Alert message props
  const [alertProps, setAlertProps] = useState({
    show: false,
    variant: null,
    heading: null,
    text: null
  });

  const resetAnnotator = () => {
    setSentenceInput({
      raw: null, language: null
    });
    setAnnotating(false);
    setTokens(null);
    setTagsSummary({});
    setAnnotateIndex(-1);
    setCanSubmit(false);
  };

  const showAlert = (show, variant, heading, text) => {
    setAlertProps({
      show: show,
      variant: variant,
      heading: heading,
      text: text
    });
  };

  // Initializes to annotation mode with the inputted sentence
  const initializeWithSentence = (sentenceInput) => {
    setSentenceInput(sentenceInput);
    const tokenizeThenInitialize = async () => {
      // Hit API to tokenize the sentence, get response
      const response = await axios.get(
        `/tokenize/`, { params: { sentence: sentenceInput.raw } });
      // TODO: Handle HTTP error codes!
      const tokens = response.data.tokens.map((token) => ({ token, tag: null }));
      setTokens(tokens);
      setAnnotating(true);
      setAnnotateIndex(0);
      setEdit(false);
      setTagsSummary(initializeTagsSummary(tokens));

      // Scroll to annotation panel
      setTimeout(() => {
        annotationRef.current.scrollIntoView();
      }, 100);
    };

    tokenizeThenInitialize();
  };

  // Initializes to annotation mode (edit)
  const initializeAnnotationEdit = (sentenceId) => {
    const fetchSentenceInformation = async () => {
      // Fetch sentence information
      const sentenceInfoResponse =
        await axios.get(`/api/sentences/${sentenceId}/`);
      const sentenceInfo = sentenceInfoResponse.data;
      setSentenceInput({id: sentenceInfo.id, language: sentenceInfo.language,
                        raw: sentenceInfo.raw });
      // Fetch annotation (on annotated-sentence endpoint)
      const annotationResponse =
        await axios.get(`/annotated-sentence/${sentenceId}/`);
      let tokens = annotationResponse.data.annotation;
      setTokens(tokens);
      setAnnotating(true);
      setAnnotateIndex(0);
      setEdit(true);
      setTagsSummary(initializeTagsSummary(tokens));

      // Scroll to annotation panel
      setTimeout(() => {
        annotationRef.current.scrollIntoView();
      }, 100);
    };

    fetchSentenceInformation();
  };

  // Annotate the token at annotateIndex with the given tag.
  const annotateCurrentWithTag = (tag) => {
    // Update tags summary with new annotated tag
    let newTagsSummary = { ...tagsSummary };
    // If there was a tag replaced, reduce its count
    if (tokens[annotateIndex].tag)
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

    let newTagsSummary = { ...tagsSummary };
    newTagsSummary[tokens[index].tag] -= 1;
    setTagsSummary(newTagsSummary);
  };

  const onValidateClick = (e) => {
    const validateRequest = async() => {
      // Save "Validated" message changelog
      await axios.post('/api/changelogs/', {
        sentence_id: sentenceInput['id'],
        description: 'Validated'
      });
    };

    if(confirm('Validate this annotation?')) {
      validateRequest().then(() => {
        resetAnnotator();
        setRefreshDatasetCounter(refreshDatasetCounter + 1);
        setTimeout(() => {
          showAlert(true, "success", "Success.",
            `Sentence with ID ${sentenceInput['id']} been validated.`);
          headerRef.current.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      });
    }
  };

  // Submits the annotated sentence to session.
  const onSubmitClick = (e) => {
    const submitRequest = async () => {
      // If isUpdate is set to false, perform POST
      if(!isEdit) {
        const createResponse = await axios.post('/api/sentences/', {
          ...sentenceInput,
          annotated: tokens.reduce((annotated, token) =>
            annotated + `<${token.tag} ${token.token}> `, "").trim()
        });
        // changelog
        await axios.post('/api/changelogs/', {
          sentence_id: createResponse.data.id,
          description: 'Created'
        });
        return createResponse.data.id;
      }

      else {
        await axios.patch(`/api/sentences/${sentenceInput.id}/`, {
          annotated: tokens.reduce((annotated, token) =>
            annotated + `<${token.tag} ${token.token}> `, "").trim()
        });
        // changelog
        await axios.post('/api/changelogs/', {
          sentence_id: sentenceInput['id'],
          description: 'Updated'
        });
        return sentenceInput['id'];
      }
    };

    if(confirm('Save this annotation?')) { 
      submitRequest().then((id) => {
        resetAnnotator();
        setRefreshDatasetCounter(refreshDatasetCounter + 1);
        setTimeout(() => {
          showAlert(true, "success", "Success.",
            `Sentence with ID ${id} been ${isEdit ? 'updated' : 'created'}.`);
          headerRef.current.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      });
    }
  };

  return (
    <>
      <span ref={headerRef} />
      {alertProps.show ?
        <Alert variant={alertProps.variant} onClose={() => setAlertProps({show: false})}
          dismissible>
          <Alert.Heading>{alertProps.heading}</Alert.Heading>
          <p className="mb-0">{alertProps.text}</p>
        </Alert> : null}
      <DatasetBrowserPanel editCallback={initializeAnnotationEdit}
        refreshCounter={refreshDatasetCounter}
        showAlertCallback={showAlert} className="mb-3" />
      <InputSentenceForm initializeCallback={initializeWithSentence}
        disabled={isAnnotating} className="border-top pt-3 mb-3" />
      <span ref={annotationRef} />
      {isAnnotating ?
        <SentenceAnnotationPanel className="border-top pt-3"
          tokens={tokens} tagsSummary={tagsSummary} isEdit={isEdit}
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
          validateCallback={onValidateClick}
          submitCallback={onSubmitClick} /> : null}
    </>
  );
};

export default App;
