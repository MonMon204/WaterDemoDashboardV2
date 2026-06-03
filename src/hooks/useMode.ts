import { useState, useCallback } from 'react';

export type UserMode = 'guest' | 'operator';

const OPERATOR_PASSWORD = 'Siemens';

export function useMode() {
  const [mode, setMode] = useState<UserMode>('guest');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const requestOperator = useCallback(() => {
    if (mode === 'operator') return;
    setPasswordError('');
    setShowPasswordModal(true);
  }, [mode]);

  const confirmPassword = useCallback(
    (input: string) => {
      if (input === OPERATOR_PASSWORD) {
        setShowPasswordModal(false);
        setPasswordError('');
        setMode('operator');
        return true;
      } else {
        setPasswordError('INCORRECT PASSWORD');
        return false;
      }
    },
    []
  );

  const cancelPassword = useCallback(() => {
    setShowPasswordModal(false);
    setPasswordError('');
  }, []);

  const setGuest = useCallback(() => {
    setMode('guest');
  }, []);

  return {
    mode,
    showPasswordModal,
    passwordError,
    requestOperator,
    confirmPassword,
    cancelPassword,
    setGuest,
  };
}
