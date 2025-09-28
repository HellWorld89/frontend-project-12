// components/TestMessageForm.jsx
import { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';

const TestMessageForm = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHTTP = async () => {
    setLoading(true);
    setResult('Testing HTTP...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          body: 'Test message via HTTP',
          channelId: '1',
          username: 'admin'
        })
      });

      const data = await response.json();
      setResult(`HTTP Success: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`HTTP Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testWebSocket = () => {
    setResult('Testing WebSocket...');
    // Будет использовать существующую логику
    setResult('WebSocket test - check console');
  };

  return (
    <div className="p-3 border bg-light mb-3">
      <h5>Тестирование отправки сообщений</h5>
      <div className="mb-2">
        <Button onClick={testHTTP} disabled={loading} className="me-2">
          Test HTTP
        </Button>
        <Button onClick={testWebSocket} variant="secondary">
          Test WebSocket
        </Button>
      </div>
      {result && <Alert variant="info">{result}</Alert>}
    </div>
  );
};

export default TestMessageForm;