import Profanity from 'leo-profanity';

// Создаем экземпляр фильтра
const profanity = Profanity;

// Инициализируем фильтр с русским словарем
let dictionaryLoaded = false;

const ensureDictionaryLoaded = () => {
  if (!dictionaryLoaded) {
    try {
      profanity.loadDictionary('ru');
      dictionaryLoaded = true;
    } catch (error) {
      console.warn('Failed to load profanity dictionary:', error);
      // Создаем пустой словарь в случае ошибки
      profanity.clearList();
      dictionaryLoaded = true;
    }
  }
};

/**
 * Фильтрует нецензурные слова в тексте
 * @param {string} text - Исходный текст
 * @returns {string} Отфильтрованный текст
 */
export const filterProfanity = (text) => {
  if (!text || typeof text !== 'string') return text;

  try {
    ensureDictionaryLoaded();
    return profanity.clean(text);
  } catch (error) {
    console.warn('Profanity filter error, returning original text:', error);
    return text;
  }
};

/**
 * Проверяет, содержит ли текст нецензурные слова
 * @param {string} text - Текст для проверки
 * @returns {boolean} true если содержит нецензурные слова
 */
export const hasProfanity = (text) => {
  if (!text || typeof text !== 'string') return false;

  try {
    ensureDictionaryLoaded();
    return profanity.check(text);
  } catch (error) {
    console.warn('Profanity check error:', error);
    return false;
  }
};

/**
 * Получает список нецензурных слов из текста
 * @param {string} text - Текст для анализа
 * @returns {string[]} Массив нецензурных слов
 */
export const getProfanityWords = (text) => {
  if (!text || typeof text !== 'string') return [];

  try {
    ensureDictionaryLoaded();
    return profanity.search(text);
  } catch (error) {
    console.warn('Profanity search error:', error);
    return [];
  }
};

export default profanity;