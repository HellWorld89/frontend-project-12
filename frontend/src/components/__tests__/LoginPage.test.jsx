import { render, screen } from '@testing-library/react';
import LoginPage from '../LoginPage';

// Простой mock для redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => ({
    isAuthenticated: false,
    loading: false,
    error: null
  }),
}));

// Mock для react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock для Formik
jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  Formik: ({ children }) => children({
    errors: {},
    touched: {},
    isSubmitting: false,
  }),
  Field: () => <input />,
  ErrorMessage: () => <div />,
  Form: ({ children }) => <form>{children}</form>,
}));

describe('LoginPage Component', () => {
  test('renders login page title', () => {
    render(<LoginPage />);
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('renders username and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/ваш ник/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
  });
});