import { useState, useEffect } from 'react'
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { loginSchema } from '../schemas/authSchemas'
import { loginUser, clearError } from '../store/authSlice'
import Header from './Header'

const LoginPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(
    state => state.auth,
  )
  const [showError, setShowError] = useState(false)

  // Редирект если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Показываем ошибку при ее появлении
  useEffect(() => {
    if (error) {
      setShowError(true)
    }
  }, [error])

  const handleSubmit = async (values, { setSubmitting }) => {
    setShowError(false)
    dispatch(clearError())

    try {
      await dispatch(loginUser(values)).unwrap()
    }
    catch (error) {
      console.error('Login error:', error)
    }
    finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-100 bg-light">
      <Header />
      <Container className="h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-5">
                <h1 className="text-center mb-4">{t('auth.login')}</h1>

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
                  initialValues={{ username: '', password: '' }}
                  validationSchema={loginSchema(t)}
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
                        <Form.Label htmlFor="username">
                          {t('auth.loginUsername')}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          autoComplete="off"
                          name="username"
                          id="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.username && !!errors.username}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {t(errors.username)}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label htmlFor="password">
                          {t('auth.password')}
                        </Form.Label>
                        <Form.Control
                          type="password"
                          autoComplete="off"
                          name="password"
                          id="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {t(errors.password)}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading || isSubmitting}
                      >
                        {loading
                          ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                {t('common.loading')}
                              </>
                            )
                          : (
                              t('auth.signIn')
                            )}
                      </Button>
                    </Form>
                  )}
                </Formik>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    {t('auth.noAccount')}
                    {' '}
                    <Link to="/signup" className="text-decoration-none">
                      {t('auth.register')}
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LoginPage
