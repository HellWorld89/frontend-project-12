import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import LoginPage from '../LoginPage';

// Простой mock для store
const mockStore = configureStore([]);

// Mock для Formik чтобы избежать сложностей
jest.mock('formik', () => ({
  Formik: ({ children }) => children({
    isSubmitting: false,
    errors: {},
    touched: {},
  }),
  Field: ({ name, type, placeholder, className }) => (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      className={className}
      data-testid={name}
    />
  ),
  ErrorMessage: ({ name }) => <div data-testid={`error-${name}`} />,
  Form: ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>{children}</form>
  ),
}));

describe('LoginPage Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        loading: false,
        error: null
      }
    });
  });

  test('renders login page title', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('renders login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('username')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });
});