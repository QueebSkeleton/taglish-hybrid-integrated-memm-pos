import { POS_TAGS } from "../settings";

export default (props) => {
  return (
    <div className={props.className}>
      <h1 className="h5">Annotate current token as</h1>
      {POS_TAGS.map(({ tag, verbose }) =>
        <button key={tag} type="button"
          className={`btn btn-sm btn-pos-${tag.toLowerCase()} me-1 mb-1`}
          onClick={e => props.annotateCallback(tag)}
          disabled={props.disabled}>
          {verbose} | {tag}
        </button>)}
    </div>
  );
};
