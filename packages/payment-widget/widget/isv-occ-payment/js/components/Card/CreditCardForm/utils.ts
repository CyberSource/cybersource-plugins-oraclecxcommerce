const YEAR_LIST_LENGTH = 20;

export const getEndYears = () => {
  const years = [];

  let endYear = new Date().getFullYear();
  for (let i = 0; i < YEAR_LIST_LENGTH; i++) {
    years.push({ name: endYear.toString(), value: endYear.toString() });
    ++endYear;
  }

  return years;
};
