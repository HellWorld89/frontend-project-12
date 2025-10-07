import Rollbar from 'rollbar'

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  environment: import.meta.env.MODE || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    code_version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  enabled: true,
  ignore: ['CanceledError', 'Network Error'],
  autoInstrument: {
    network: true,
    log: true,
    dom: true,
    navigation: true,
    connectivity: true,
  },
}

const rollbar = new Rollbar(rollbarConfig)

export const trackError = (error, context = {}) => {
  console.error('Tracked error:', error, context)
  rollbar.error(error, context)
}

export const trackWarning = (message, context = {}) => {
  console.warn('Tracked warning:', message, context)
  rollbar.warning(message, context)
}

export const trackInfo = (message, context = {}) => {
  console.info('Tracked info:', message, context)
  rollbar.info(message, context)
}

export const trackCritical = (error, context = {}) => {
  console.error('Tracked critical error:', error, context)
  rollbar.critical(error, context)
}

export const trackUserAction = (action, metadata = {}) => {
  rollbar.info(`User action: ${action}`, {
    action,
    ...metadata,
    timestamp: new Date().toISOString(),
  })
}

export default rollbar
