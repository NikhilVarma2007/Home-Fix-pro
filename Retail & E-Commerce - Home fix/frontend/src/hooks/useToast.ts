import { useCallback } from 'react';
import { useApp } from '../AppContext';

export function useToast() {
  const { dispatch } = useApp();

  const show = useCallback((message: string, type: 'default' | 'success' | 'error' = 'default') => {
    dispatch({ type: 'SHOW_TOAST', message, toastType: type });
    setTimeout(() => {
      dispatch({ type: 'HIDE_TOAST' });
    }, 2800);
  }, [dispatch]);

  return { show };
}
