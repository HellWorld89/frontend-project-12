import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { ToastContainer } from 'react-toastify'
import { Provider, ErrorBoundary } from '@rollbar/react'
import store from './store'
import i18n from './i18n'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'

const rollbarConfig = {
  accessToken: import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN,
  environment: import.meta.env.MODE || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: import.meta.env.MODE || 'development',
    client: {
      javascript: {
        code_version: '1.0.0',
      },
    },
  },
}

const ErrorFallback = ({ resetError }) => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <h2 className="text-danger mb-4">Что-то пошло не так</h2>
        <p className="text-muted mb-4">
          Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить
          страницу.
        </p>
        <button className="btn btn-primary" onClick={resetError}>
          Обновить страницу
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider config={rollbarConfig}>
      <ErrorBoundary fallbackUI={ErrorFallback}>
        <I18nextProvider i18n={i18n}>
          <ReduxProvider store={store}>
            <BrowserRouter>
              <App />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </BrowserRouter>
          </ReduxProvider>
        </I18nextProvider>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>,
)
