// components/modals/AddChannelModal.jsx
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { createChannel, resetOperationStatus } from '../../store/channelsSlice';

const AddChannelModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { items: channels } = useSelector((state) => state.channels);
  const { operationStatus } = useSelector((state) => state.channels);

  // Состояние для хранения имен каналов на момент открытия модального окна
  const [channelNamesOnOpen, setChannelNamesOnOpen] = useState(new Set());

  // При открытии модального окна сохраняем текущие имена каналов
  useEffect(() => {
    if (show) {
      const names = channels.map(channel => channel.name.toLowerCase());
      setChannelNamesOnOpen(new Set(names));

      // Автофокус на поле ввода
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // При закрытии сбрасываем статус
      dispatch(resetOperationStatus());
    }
  }, [show, channels, dispatch]);

  // Схема валидации с проверкой уникальности
  const getValidationSchema = () => {
    return yup.object().shape({
      name: yup
        .string()
        .min(3, 'Название канала должно быть от 3 до 20 символов')
        .max(20, 'Название канала должно быть от 3 до 20 символов')
        .test(
          'unique-name',
          'Канал с таким именем уже существует',
          (value) => !channelNamesOnOpen.has(value.toLowerCase())
        )
        .required('Обязательное поле'),
    });
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createChannel({ name: values.name })).unwrap();
      resetForm();
      onHide();
    } catch (error) {
      console.error('Error creating channel:', error);
      // Ошибка от сервера будет показана через operationStatus.error
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = () => {
    dispatch(resetOperationStatus());
    onHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={{ name: '' }}
        validationSchema={getValidationSchema()}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
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
            <Modal.Body>
              {/* Показываем ошибки от сервера */}
              {operationStatus.error && (
                <Alert variant="danger" className="mb-3">
                  {operationStatus.error}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label htmlFor="name">Имя канала</Form.Label>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  name="name"
                  id="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.name && !!errors.name}
                  disabled={isSubmitting || operationStatus.loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Введите название канала (3-20 символов)"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
                {!errors.name && values.name.length > 0 && (
                  <Form.Text className="text-muted">
                    ✓ Название доступно
                  </Form.Text>
                )}
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={handleHide}
                disabled={isSubmitting || operationStatus.loading}
              >
                Отменить
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  isSubmitting ||
                  operationStatus.loading ||
                  !!errors.name ||
                  !values.name.trim()
                }
              >
                {(isSubmitting || operationStatus.loading) ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Добавляем...
                  </>
                ) : (
                  'Добавить'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddChannelModal;