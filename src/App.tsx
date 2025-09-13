import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InsightsPage from './pages/InsightsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/insights" element={<InsightsPage />} />
    </Routes>
  );
}

export default App;