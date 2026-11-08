export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('sf_device_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('sf_device_id', id);
  }
  return id;
};

