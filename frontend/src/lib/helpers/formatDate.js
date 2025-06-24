function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0"); // Получить день и добавить ведущий ноль
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0, поэтому добавляем 1
  const year = date.getFullYear(); // Получить полный год

  return `${month}-${day}-${year}`;
}

export default formatDate;
