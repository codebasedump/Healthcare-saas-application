// frontend/hooks/useUser.js
export function useUser() {
  const user = JSON.parse(localStorage.getItem('user')); // or from context
  return { user };
}