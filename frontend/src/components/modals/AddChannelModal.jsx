import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { Formik } from 'formik'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  createChannel,
  resetOperationStatus,
  setCurrentChannel,
} from '../../store/channelsSlice'
import { filterProfanity, hasProfanity } from '../../utils/profanityFilter'
import Portal from '../Portal'

// Храним Set с ID каналов, для которых уже показали уведомление
const shownChannelIds = new Set()

const AddChannelModal = ({ show, onHide }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const inputRef = useRef(null)
  const { items: channels } = useSelector(state => state.channels)
  const { operationStatus } = useSelector(state => state.channels)

  const [createdChannelId, setCreatedChannelId] = useState(null)
  const [channelNamesOnOpen, setChannelNamesOnOpen] = useState(new Set())

  useEffect(() => {
    if (createdChannelId && show) {
      const newChannelExists = channels.some(
        channel => channel.id === createdChannelId,
      )

      if (newChannelExists) {
        console.log(
          '✅ New channel detected in list, switching to it:',
          createdChannelId,
        )

        // Показываем toast-уведомление только если еще не показывали для этого канала
        if (!shownChannelIds.has(createdChannelId)) {
          toast.success(t('toast.channelAdded'))
          shownChannelIds.add(createdChannelId)

          // Очищаем через некоторое время чтобы не накапливать ID
          setTimeout(() => {
            shownChannelIds.delete(createdChannelId)
          }, 5000)
        }

        dispatch(setCurrentChannel(createdChannelId))
        setTimeout(() => {
          onHide()
          setCreatedChannelId(null)
        }, 300)
      }
    }
  }, [channels, createdChannelId, show, dispatch, onHide, t])

  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setCreatedChannelId(null)
    }

    if (!show) {
      dispatch(resetOperationStatus())
      setCreatedChannelId(null)
    }
  }, [show, dispatch])

  const getValidationSchema = () => {
    return yup.object().shape({
      name: yup
        .string()
        .min(3, t('validation.channelNameLength'))
        .max(20, t('validation.channelNameLength'))
        .test(
          'unique-name',
          t('validation.channelNameUnique'),
          value => !channelNamesOnOpen.has(value.toLowerCase()),
        )
        .required(t('validation.required')),
    })
  }

  useEffect(() => {
    if (show) {
      const names = channels.map(channel => channel.name.toLowerCase())
      setChannelNamesOnOpen(new Set(names))
    }
  }, [show, channels])

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Фильтруем нецензурные слова в названии канала
      const filteredName = filterProfanity(values.name)

      // Показываем предупреждение если были отфильтрованы слова
      if (hasProfanity(values.name) && filteredName !== values.name) {
        toast.warn(t('profanity.channelNameFiltered'))
      }

      const result = await dispatch(
        createChannel({ name: filteredName }),
      ).unwrap()
      if (result && result.id) {
        setCreatedChannelId(result.id)
        console.log('✅ Channel creation response received:', result.id)
      }
      resetForm()
    }
    catch (error) {
      console.error('Error creating channel:', error)
      // Показываем toast-уведомление об ошибке
      toast.error(t('toast.error'))
      setSubmitting(false)
    }
  }

  const handleHide = () => {
    dispatch(resetOperationStatus())
    setCreatedChannelId(null)
    onHide()
  }

  const isWaitingForWebSocket
    = createdChannelId && !channels.some(ch => ch.id === createdChannelId)
  const isChannelCreated
    = createdChannelId && channels.some(ch => ch.id === createdChannelId)

  return (
    <Portal>
      <Modal show={show} onHide={handleHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('channels.addChannel')}</Modal.Title>
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

                {isWaitingForWebSocket && (
                  <Alert variant="info" className="mb-3">
                    <div className="d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('channels.adding')}
                    </div>
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="name">
                    {t('channels.channelName')}
                  </Form.Label>
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    name="name"
                    id="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                    disabled={
                      isSubmitting
                      || operationStatus.loading
                      || isWaitingForWebSocket
                      || isChannelCreated
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    placeholder={t('validation.channelNameLength')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errors.name)}
                  </Form.Control.Feedback>
                  {!errors.name && values.name.length > 0 && (
                    <Form.Text className="text-muted">
                      ✓
                      {t('channels.nameAvailable')}
                    </Form.Text>
                  )}
                </Form.Group>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={handleHide}
                  disabled={
                    isSubmitting || operationStatus.loading || isChannelCreated
                  }
                >
                  {isChannelCreated ? t('common.close') : t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={
                    isSubmitting
                    || operationStatus.loading
                    || !!errors.name
                    || !values.name.trim()
                    || isWaitingForWebSocket
                    || isChannelCreated
                  }
                >
                  {isSubmitting || operationStatus.loading
                    ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {t('channels.adding')}
                        </>
                      )
                    : isWaitingForWebSocket
                      ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            {t('common.loading')}
                          </>
                        )
                      : isChannelCreated
                        ? (
                            '✅ ' + t('common.success')
                          )
                        : (
                            t('channels.add')
                          )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Portal>

  )
}

export default AddChannelModal
