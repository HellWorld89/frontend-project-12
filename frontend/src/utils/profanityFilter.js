import Profanity from 'leo-profanity'

// Создаем экземпляр фильтра
const profanity = Profanity

// Загружаем английский словарь нецензурных слов (вместо русского)
profanity.loadDictionary('en')
profanity.loadDictionary('ru')

profanity.add([
  'boobs',
  'fuck',
  'ass',
  'shit',
  'piss',
  'cunt',
  'cock',
  'dick',
  'penis',
  'pussy',
])
/**
 * Фильтрует нецензурные слова в тексте
 * @param {string} text - Исходный текст
 * @returns {string} Отфильтрованный текст
 */
export const filterProfanity = (text) => {
  if (!text || typeof text !== 'string') return text

  return profanity.clean(text)
}

/**
 * Проверяет, содержит ли текст нецензурные слова
 * @param {string} text - Текст для проверки
 * @returns {boolean} true если содержит нецензурные слова
 */
export const hasProfanity = (text) => {
  if (!text || typeof text !== 'string') return false

  return profanity.check(text)
}

/**
 * Получает список нецензурных слов из текста
 * @param {string} text - Текст для анализа
 * @returns {string[]} Массив нецензурных слов
 */
export const getProfanityWords = (text) => {
  if (!text || typeof text !== 'string') return []

  return profanity.search(text)
}

export default profanity
