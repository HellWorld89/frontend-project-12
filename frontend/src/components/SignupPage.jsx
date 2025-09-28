import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as yup from 'yup';
import { registerUser } from '../store/authSlice';
import Header from './Header';

// Схема валидации
const signupSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Имя пользователя должно быть от 3 до 20 символов')
    .max(20, 'Имя пользователя должно быть от 3 до 20 символов')
    .required('Обязательное поле'),
  password: yup
    .string()
    .min(6, 'Пароль должен быть не менее 6 символов')
    .required('Обязательное поле'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Обязательное поле'),
});

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showError, setShowError] = useState(false);

  // Редирект если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Показываем ошибку при ее появлении
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setShowError(false);

    try {
      // Отправляем только username и password, confirmPassword не нужен серверу
      const result = await dispatch(registerUser({
        username: values.username,
        password: values.password,
      })).unwrap();

      // После успешной регистрации автоматически логинимся
      console.log('✅ Registration successful:', result);
      // Редирект произойдет автоматически из-за изменения isAuthenticated

    } catch (error) {
      console.error('❌ Registration failed:', error);
      // Ошибка уже будет в состоянии Redux
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-100 bg-light">
      <Header />
      <Container className="h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-5">
                <h1 className="text-center mb-4">Регистрация</h1>

                {showError && error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setShowError(false)}
                    className="mb-4"
                  >
                    {error}
                  </Alert>
                )}

                <Formik
                  initialValues={{
                    username: '',
                    password: '',
                    confirmPassword: '',
                  }}
                  validationSchema={signupSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="username">Имя пользователя</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          id="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.username && !!errors.username}
                          disabled={loading}
                          placeholder="Введите имя пользователя (3-20 символов)"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="password">Пароль</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          id="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          disabled={loading}
                          placeholder="Введите пароль (не менее 6 символов)"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label htmlFor="confirmPassword">Подтверждение пароля</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                          disabled={loading}
                          placeholder="Повторите пароль"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading || isSubmitting}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Регистрируем...
                          </>
                        ) : (
                          'Зарегистрироваться'
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="text-decoration-none">
                      Войти
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignupPage;