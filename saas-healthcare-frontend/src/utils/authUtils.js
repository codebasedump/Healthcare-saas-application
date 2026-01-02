export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('currentUser'));
};

export const isDoctor = () => getCurrentUser()?.role === 'doctor';
export const isAdmin = () => getCurrentUser()?.role === 'admin';