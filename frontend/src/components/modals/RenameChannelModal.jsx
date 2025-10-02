import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { renameChannel, resetOperationStatus } from '../../store/channelsSlice';
import { filterProfanity, hasProfanity } from '../../utils/profanityFilter';

const RenameChannelModal = ({ show, onHide, channel }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const { items: channels } = useSelector((state) => state.channels);
  const { operationStatus } = useSelector((state) => state.channels);
  const [channelNamesOnOpen, setChannelNamesOnOpen] = useState(new Set());

  useEffect(() => {
    if (show && channel) {
      const names = channels
        .filter((ch) => ch.id !== channel.id)
        .map((ch) => ch.name.toLowerCase());
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

  const getValidationSchema = () => {
    return yup.object().shape({
      name: yup
        .string()
        .min(3, t('validation.channelNameLength'))
        .max(20, t('validation.channelNameLength'))
        .test(
          'unique-name',
          t('validation.channelNameUnique'),
          (value) => !channelNamesOnOpen.has(value.toLowerCase())
        )
        .required(t('validation.required')),
    });
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!channel) return;

    try {
      // Фильтруем нецензурные слова в названии канала
      const filteredName = filterProfanity(values.name);

      // Показываем предупреждение если были отфильтрованы слова
      if (hasProfanity(values.name) && filteredName !== values.name) {
        toast.warn(t('profanity.channelNameFiltered'));
      }

      await dispatch(renameChannel({ id: channel.id, name: filteredName })).unwrap();

      // Показываем toast-уведомление об успешном переименовании
      toast.success(t('toast.channelRenamed'));

      resetForm();
      onHide();
    } catch (error) {
      console.error('Error renaming channel:', error);
      // Показываем toast-уведомление об ошибке
      toast.error(t('toast.error'));
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
        <Modal.Title>{t('channels.renameChannel')}</Modal.Title>
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
                  <Form.Label htmlFor="name">{t('channels.channelName')}</Form.Label>
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
                    placeholder={t('validation.channelNameLength')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errors.name)}
                  </Form.Control.Feedback>
                  {!errors.name && values.name.length > 0 && isChanged && (
                    <Form.Text className="text-muted">
                      ✓ {t('channels.nameAvailable')}
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
                  {t('common.cancel')}
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
                      {t('channels.renaming')}
                    </>
                  ) : (
                    t('channels.rename')
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
