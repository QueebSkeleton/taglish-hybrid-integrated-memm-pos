import { useState } from 'react';

import axios from 'axios';

import InputSentenceForm from './InputSentenceForm';
import SentenceAnnotationPanel from './annotation-panel';
import DatasetBrowserPanel from './dataset-browser-panel';

import { POS_TAGS } from './settings';

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
      setTagsSummary(initializeTagsSummary(tokens))
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

  // Submits the annotated sentence to session.
  const onSubmitClick = (e) => {
    const submitRequest = async () => {
      // If isUpdate is set to false, perform POST
      if(!isEdit)
        await axios.post('/api/sentences/', {
          ...sentenceInput,
          annotated: tokens.reduce((annotated, token) =>
            annotated + `<${token.tag} ${token.token}> `, "").trim()
        });
      else
        await axios.patch(`/api/sentences/${sentenceInput.id}/`, {
          annotated: tokens.reduce((annotated, token) =>
            annotated + `<${token.tag} ${token.token}> `, "").trim()
        });
    };

    submitRequest().then(() => { window.location.reload(); });
  };

  return (
    <>
      <DatasetBrowserPanel editCallback={initializeAnnotationEdit}
        className="mb-3" />
      <InputSentenceForm initializeCallback={initializeWithSentence}
        disabled={isAnnotating} className="border-top pt-3 mb-3" />
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
