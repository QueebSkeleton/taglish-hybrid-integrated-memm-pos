import { Table } from 'react-bootstrap';

export default (props) => {
  return (
    <Table striped hover size="sm">
      <tbody>
        <tr><th colSpan="2" className="text-center">Overall</th></tr>
        <tr><td># of tokens</td><td>{props.tokens.length}</td></tr>
        <tr><th colSpan="2" className="text-center">Per Tag</th></tr>
        {Object.entries(props.tagsSummary).map(([tag, count]) =>
          <tr key={tag}><td>{tag}</td><td>{count}</td></tr>)}
      </tbody>
    </Table>
  );
};
