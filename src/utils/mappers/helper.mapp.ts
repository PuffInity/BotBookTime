/**
 * @file helper.mapp.ts
 * @summary Shared mapper utils for type normalization.
 */

/**
 * uk: Безпечно нормалізує значення у Date.
 * en: Safely normalizes value into Date.
 * cz: Bezpečně normalizuje hodnotu na Date.
 * @param value uk/en/cz: Значення/Value/Hodnota.
 * @returns uk/en/cz: Обʼєкт Date/Date object/Date objekt.
 */
export const toDate = (value: Date | string | number): Date => {
    return value instanceof Date ? value : new Date(value);
};
