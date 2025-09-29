// components/modals/RenameChannelModal.jsx
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { renameChannel, resetOperationStatus } from '../../store/channelsSlice';

const RenameChannelModal = ({ show, onHide, channel }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { items: channels } = useSelector((state) => state.channels);
  const { operationStatus } = useSelector((state) => state.channels);
  const [channelNamesOnOpen, setChannelNamesOnOpen] = useState(new Set());

  useEffect(() => {
    if (show && channel) {
      // Сохраняем имена каналов, исключая текущий переименовываемый
      const names = channels
        .filter(ch => ch.id !== channel.id)
        .map(ch => ch.name.toLowerCase());
      setChannelNamesOnOpen(new Set(names));

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    } else {
      dispatch(resetOperationStatus());
    }
  }, [show, channel, channels, dispatch]);

  // Схема валидации для переименования
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
    if (!channel) return;

    try {
      await dispatch(renameChannel({ id: channel.id, name: values.name })).unwrap();
      resetForm();
      onHide();
    } catch (error) {
      console.error('Error renaming channel:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = () => {
    dispatch(resetOperationStatus());
    onHide();
  };

  if (!channel) return null;

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Переименовать канал</Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={{ name: channel.name }}
        validationSchema={getValidationSchema()}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => {
          const isChanged = values.name !== channel.name;

          return (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
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
                    placeholder="Введите новое название канала"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                  {!errors.name && values.name.length > 0 && isChanged && (
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
                    !values.name.trim() ||
                    !isChanged
                  }
                >
                  {(isSubmitting || operationStatus.loading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Переименовываем...
                    </>
                  ) : (
                    'Переименовать'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default RenameChannelModal;