import { createSlice } from '@reduxjs/toolkit'

const loadCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedUser = window.localStorage.getItem('games-auth-user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

const initialState = {
  currentUser: loadCurrentUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload
    },
    logout: (state) => {
      state.currentUser = null
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
