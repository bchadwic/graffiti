const rootStyles = getComputedStyle(document.documentElement);

export const COLUMN_COUNT = parseFloat(rootStyles.getPropertyValue('--column-count').trim());
export const ROW_COUNT = parseFloat(rootStyles.getPropertyValue('--row-count').trim());