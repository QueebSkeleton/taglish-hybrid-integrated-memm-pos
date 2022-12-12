import { Badge, Form } from 'react-bootstrap';

export const AnnotatedTokenBadge = (props) => {
  return (
    <Badge bg={`pos-${props.tag.toLowerCase()}`}
      className={props.className}
      onClick={props.onClick}>
      {props.token} | {props.tag}
    </Badge>
  );
};

export default (props) => {
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
                'border-bottom border-primary border-2 pb-1' : null}` +
                ' unannotated-token'}
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
