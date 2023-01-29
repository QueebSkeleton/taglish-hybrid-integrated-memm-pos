import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Table } from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default (props) => {
  const [labels, setLabels] = useState([]);
  const [tagalogPerformance, setTagalogPerformance] = useState([]);
  const [englishPerformance, setEnglishPerformance] = useState([]);
  const [taglishPerformance, setTaglishPerformance] = useState([]);

  const [tagalogDatasetSummary, setTagalogDatasetSummary] = useState(
    { validated: 0, nonvalidated: 0 });
  const [englishDatasetSummary, setEnglishDatasetSummary] = useState(
    { validated: 0, nonvalidated: 0 });
  const [taglishDatasetSummary, setTaglishDatasetSummary] = useState(
    { validated: 0, nonvalidated: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/model-health/`);

      let datasetSummaryResponse = response.data.datasetSummary;
      setTagalogDatasetSummary(datasetSummaryResponse.tagalog);
      setEnglishDatasetSummary(datasetSummaryResponse.english);
      setTaglishDatasetSummary(datasetSummaryResponse.taglish);
      setLabels(response.data.modelHealth.dates);
      setTagalogPerformance(response.data.modelHealth.tagalogPerformance);
      setEnglishPerformance(response.data.modelHealth.englishPerformance);
      setTaglishPerformance(response.data.modelHealth.taglishPerformance);
    };

    fetchData();
  }, []);

  return (
    <div className={props.className}>
      <Row className="justify-content-center g-4">
        <Col sm={5}>
          <h1 className="h5">Dataset Summary</h1>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Language</th>
                <th>Validated</th>
                <th>Non-validated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tagalog</td>
                <td>{tagalogDatasetSummary.validated}</td>
                <td>{tagalogDatasetSummary.nonvalidated}</td>
              </tr>
              <tr>
                <td>English</td>
                <td>{englishDatasetSummary.validated}</td>
                <td>{englishDatasetSummary.nonvalidated}</td>
              </tr>
              <tr>
                <td>Taglish</td>
                <td>{taglishDatasetSummary.validated}</td>
                <td>{taglishDatasetSummary.nonvalidated}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
        <Col sm={5}>
          <Bar options={{
            indexAxis: 'y',
            elements: {
              bar: {
                borderWidth: 2,
              },
            },
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: 'Online Model Performance Metrics',
              },
            },
          }} data={{
            labels,
            datasets: [
              {
                label: 'Tagalog Performance',
                data: tagalogPerformance,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
              {
                label: 'English Performance',
                data: englishPerformance,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
              {
                label: 'Taglish Performance',
                data: taglishPerformance,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
              },
            ],
          }} />
        </Col>
      </Row>
    </div>
  );
};
