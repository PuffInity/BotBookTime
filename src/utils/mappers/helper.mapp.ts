/**
 * @file helper.mapp.ts
 * @summary Допоміжні mapper-утиліти для нормалізації типів.
 */

/**
 * @summary Безпечно перетворює значення у Date.
 * @param {Date | string | number} value - Вхідне значення дати/часу.
 * @returns {Date}
 */
export const toDate = (value: Date | string | number): Date => {
    return value instanceof Date ? value : new Date(value);
};
