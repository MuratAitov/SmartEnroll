function getNextMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 1 : 8 - day;
    return new Date(today.setDate(today.getDate() + diff));
}

function formatDateForICS(date, hours, minutes) {
    return date.getFullYear() +
           String(date.getMonth() + 1).padStart(2, '0') +
           String(date.getDate()).padStart(2, '0') + 'T' +
           String(hours).padStart(2, '0') +
           String(minutes).padStart(2, '0') + '00';
}