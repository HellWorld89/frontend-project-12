### Hexlet tests and linter status:
[![Actions Status](https://github.com/HellWorld89/frontend-project-12/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/HellWorld89/frontend-project-12/actions)

# Hexlet Chat - Real-time Slack-like Application

[![Render Deployment](https://img.shields.io/website?url=https%3A%2F%2Ffrontend-project-12-e34n.onrender.com&label=Render%20Deployment&style=for-the-badge)](https://frontend-project-12-e34n.onrender.com)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-1.9.5-764abc?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-ff69b4?style=for-the-badge&logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🚀 О проекте

Hexlet Chat — это полнофункциональное real-time приложение для обмена сообщениями, созданное в рамках дипломного проекта на Hexlet. Приложение имитирует основные функции Slack, позволяя пользователям общаться в реальном времени через каналы и прямые сообщения.

**Живая демо-версия:** [https://frontend-project-12-e34n.onrender.com](https://frontend-project-12-e34n.onrender.com)

## ✨ Особенности

- 📨 **Real-time обмен сообщениями** через WebSocket соединения
- 🔐 **Аутентификация и авторизация** пользователей
- 📁 **Создание и управление каналами** (добавление, переименование, удаление)
- 👥 **Прямые сообщения** между пользователями
- 🎨 **Интуитивный интерфейс** на основе React Bootstrap
- 📱 **Адаптивный дизайн** для мобильных устройств
- ⚡ **Высокая производительность** благодаря оптимизациям React и Redux

## 🛠 Технологический стек

### Frontend
- **React 18** с функциональными компонентами и хуками
- **Redux Toolkit** для управления состоянием приложения
- **React Router** для клиентской маршрутизации
- **Formik + Yup** для работы с формами и валидации
- **React Bootstrap** для UI компонентов
- **Axios** для HTTP запросов
- **WebSocket API** для real-time взаимодействия

### Backend
- **Node.js** серверная часть
- **Express.js** фреймворк
- **WebSocket** поддержка

### Инфраструктура
- **Vite** для сборки проекта
- **Render** для деплоя
- **ESLint** для линтинга кода

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 16 или выше
- npm или yarn

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/HellWorld89/frontend-project-12.git
cd frontend-project-12
```

2. Установите зависимости:
```bash
npm install
```

3. Перейдите в директорию фронтенда и установите зависимости:
```bash
cd frontend
npm install
```

4. Запустите сервер разработки:
```bash
# Из корневой директории
make start
```

Или альтернативный способ:
```bash
# Запуск сервера из корневой директории
npx start-server -s ./frontend/dist -p 5001

# В другом терминале запустите фронтенд
cd frontend
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## 📦 Сборка для production

```bash
# Сборка фронтенда
make build

# Или через npm скрипты
npm run build
```

Собранная версия будет доступна в папке `frontend/dist`.

## 🎯 Цели проекта

Этот дипломный проект демонстрирует полный спектр задач, с которыми сталкиваются React-разработчики в реальной работе:

- Работа с веб-сокетами для real-time взаимодействия
- Взаимодействие с REST API
- Использование React с современными хуками
- Управление состоянием через Redux (reduxjs/toolkit)
- Организация клиентского роутинга
- Реализация аутентификации и авторизации
- Оптимизация производительности React-приложения
- Сборка проекта с помощью Vite и деплой на PaaS-платформу

## 📁 Структура проекта

```
frontend-project-12/
├── frontend/                 # React-приложение
│   ├── src/
│   │   ├── components/       # React-компоненты
│   │   ├── store/           # Redux store и slices
│   │   ├── hooks/           # Кастомные хуки
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── package.json             # Корневой package.json
├── Makefile                # Скрипты для сборки и запуска
└── README.md
```

## 🤝 Разработка

Проект разработан в рамках обучения на курсе "Фронтенд-разработчик" в [Hexlet](https://hexlet.io).

## 📄 Лицензия

Этот проект создан в учебных целях.