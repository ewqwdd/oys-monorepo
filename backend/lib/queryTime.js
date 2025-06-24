function queryTime(timeString) {
    // Регулярное выражение для извлечения времени
    const timeRegex = /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/;
    const match = timeString.match(timeRegex);

    if (!match) {
        throw new Error("Неверный формат строки времени");
    }

    const fromHours = parseInt(match[1], 10); // Часы начала
    const fromMinutes = parseInt(match[2], 10); // Минуты начала
    const toHours = parseInt(match[3], 10); // Часы окончания
    const toMinutes = parseInt(match[4], 10); // Минуты окончания

    // Преобразуем в минуты
    const timeFrom = fromHours * 60 + fromMinutes;
    const timeTo = toHours * 60 + toMinutes;

    return { timeFrom, timeTo };
}

module.exports = queryTime;