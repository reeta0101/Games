import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
  },
});
