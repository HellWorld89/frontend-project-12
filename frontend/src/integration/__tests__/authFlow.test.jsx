// src/integration/__tests__/authFlow.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../../store';
import App from '../../App';

// Mock API responses
const mockApiResponse = {
  token: 'test-token-123',
  username: 'admin'
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockApiResponse),
  })
);

test('complete auth flow', async () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );

  // Fill login form
  await userEvent.type(screen.getByLabelText(/ваш ник/i), 'admin');
  await userEvent.type(screen.getByLabelText(/пароль/i), 'admin');
  await userEvent.click(screen.getByRole('button', { name: /войти/i }));

  // Check redirect and data loading
  await waitFor(() => {
    expect(screen.getByText(/добро пожаловать в hexlet chat/i)).toBeInTheDocument();
  });
});