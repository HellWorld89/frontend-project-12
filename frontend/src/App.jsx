import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import NotFoundPage from './components/NotFoundPage';
// import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <>
      <Container fluid>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
