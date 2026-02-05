export const formatDate = (date, timezone = 'local') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (timezone === 'utc') {
    return d.toUTCString();
  }
  
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export const getCurrentDate = () => {
  return new Date();
};

export const getTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatDateWithTimezone = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const timezone = getTimezone();
  
  return {
    local: d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    utc: d.toUTCString(),
    timezone
  };
};

