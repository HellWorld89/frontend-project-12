// components/modals/AddChannelModal.jsx
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import {
  createChannel,
  resetOperationStatus,
  setCurrentChannel
} from '../../store/channelsSlice';

const AddChannelModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { items: channels } = useSelector((state) => state.channels);
  const { operationStatus } = useSelector((state) => state.channels);
  const { currentChannelId } = useSelector((state) => state.channels);

  // Локальное состояние для отслеживания созданного канала
  const [createdChannelId, setCreatedChannelId] = useState(null);
  const [channelNamesOnOpen, setChannelNamesOnOpen] = useState(new Set());

  // Следим за WebSocket событиями через глобальное состояние
  useEffect(() => {
    if (createdChannelId && show) {
      // Проверяем, появился ли наш канал в общем списке
      const newChannelExists = channels.some(channel => channel.id === createdChannelId);

      if (newChannelExists) {
        console.log('✅ New channel detected in list, switching to it:', createdChannelId);

        // Переключаемся на новый канал
        dispatch(setCurrentChannel(createdChannelId));

        // Закрываем модальное окно с задержкой для плавности
        setTimeout(() => {
          onHide();
          setCreatedChannelId(null); // Сбрасываем состояние
        }, 300);
      }
    }
  }, [channels, createdChannelId, show, dispatch, onHide]);

  // Автофокус и сброс статуса
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setCreatedChannelId(null); // Сбрасываем при открытии
    }

    if (!show) {
      dispatch(resetOperationStatus());
      setCreatedChannelId(null);
    }
  }, [show, dispatch]);

  // Схема валидации
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

  useEffect(() => {
    if (show) {
      const names = channels.map(channel => channel.name.toLowerCase());
      setChannelNamesOnOpen(new Set(names));
    }
  }, [show, channels]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Отправляем запрос на создание канала
      const result = await dispatch(createChannel({ name: values.name })).unwrap();

      // ✅ СОХРАНЯЕМ ID КАНАЛА ИЗ ОТВЕТА СЕРВЕРА
      if (result && result.id) {
        setCreatedChannelId(result.id);
        console.log('✅ Channel creation response received:', result.id);
      }

      resetForm();
      // НЕ закрываем модальное окно здесь - ждем WebSocket события
    } catch (error) {
      console.error('Error creating channel:', error);
      setSubmitting(false);
    }
  };

  const handleHide = () => {
    dispatch(resetOperationStatus());
    setCreatedChannelId(null);
    onHide();
  };

  // Определяем статус для UI
  const isWaitingForWebSocket = createdChannelId && !channels.some(ch => ch.id === createdChannelId);
  const isChannelCreated = createdChannelId && channels.some(ch => ch.id === createdChannelId);

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
              {operationStatus.error && (
                <Alert variant="danger" className="mb-3">
                  {operationStatus.error}
                </Alert>
              )}

              {/* Статус создания канала */}
              {isWaitingForWebSocket && (
                <Alert variant="info" className="mb-3">
                  <div className="d-flex align-items-center">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Канал создается... Ожидаем подтверждения
                  </div>
                </Alert>
              )}

              {isChannelCreated && (
                <Alert variant="success" className="mb-3">
                  ✅ Канал успешно создан! Переключаемся...
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
                  disabled={isSubmitting || operationStatus.loading || isWaitingForWebSocket || isChannelCreated}
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
                disabled={isSubmitting || operationStatus.loading || isChannelCreated}
              >
                {isChannelCreated ? 'Закрыть' : 'Отменить'}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  isSubmitting ||
                  operationStatus.loading ||
                  !!errors.name ||
                  !values.name.trim() ||
                  isWaitingForWebSocket ||
                  isChannelCreated
                }
              >
                {isSubmitting || operationStatus.loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Добавляем...
                  </>
                ) : isWaitingForWebSocket ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Ожидаем...
                  </>
                ) : isChannelCreated ? (
                  '✅ Успешно!'
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