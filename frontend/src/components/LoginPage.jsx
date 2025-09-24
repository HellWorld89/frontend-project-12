import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { loginUser, clearError } from '../store/authSlice';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .required('Имя пользователя обязательно'),
  password: Yup.string()
    .min(5, 'Пароль должен содержать минимум 6 символов')
    .required('Пароль обязателен'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  // В функции handleSubmit убедитесь, что отправляются правильные данные
const handleSubmit = async (values) => {
  dispatch(clearError());
  const result = await dispatch(loginUser(values));

  if (loginUser.fulfilled.match(result)) {
    navigate('/');
  }
};

  return (
    <div className="h-100 bg-light">
      <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="/">Hexlet Chat</a>
        </div>
      </nav>

      <div className="h-100">
        <Container fluid className="h-100">
          <Row className="justify-content-center align-content-center h-100">
            <Col xs={12} md={8} xxl={6}>
              <Card className="shadow-sm">
                <Card.Body className="row p-5">
                  <Col xs={12} md={6} className="d-flex align-items-center justify-content-center">
                    <img
                      src="/assets/avatar-DIE1AEpS.jpg"
                      className="rounded-circle"
                      alt="Войти"
                      style={{ width: '150px', height: '150px' }}
                    />
                  </Col>

                  <Col xs={12} md={6} className="mt-3 mt-md-0">
                    <Formik
                      initialValues={{ username: '', password: '' }}
                      validationSchema={LoginSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          <h1 className="text-center mb-4">Войти</h1>

                          {error && (
                            <Alert variant="danger" className="mb-3">
                              {error}
                            </Alert>
                          )}

                          <div className="form-floating mb-3">
                            <Field
                              name="username"
                              type="text"
                              autoComplete="username"
                              className={`form-control ${errors.username && touched.username ? 'is-invalid' : ''}`}
                              placeholder="Ваш ник"
                              id="username"
                            />
                            <label htmlFor="username">Ваш ник</label>
                            <ErrorMessage
                              name="username"
                              component="div"
                              className="invalid-tooltip"
                            />
                          </div>

                          <div className="form-floating mb-4">
                            <Field
                              name="password"
                              type="password"
                              autoComplete="current-password"
                              className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                              placeholder="Пароль"
                              id="password"
                            />
                            <label htmlFor="password">Пароль</label>
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-tooltip"
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-100 mb-3 btn btn-outline-primary"
                            disabled={loading}
                          >
                            {loading ? 'Вход...' : 'Войти'}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </Col>
                </Card.Body>

                <div className="card-footer p-4">
                  <div className="text-center">
                    <span>Нет аккаунта?</span>{' '}
                    <a href="/signup" onClick={(e) => {
                      e.preventDefault();
                      console.log('Переход на страницу регистрации');
                    }}>
                      Регистрация
                    </a>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LoginPage;