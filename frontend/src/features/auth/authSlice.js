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

const loadAdminUser = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedAdmin = window.localStorage.getItem('games-admin-user')
    return storedAdmin ? JSON.parse(storedAdmin) : null
  } catch {
    return null
  }
}

const initialState = {
  currentUser: loadCurrentUser(),
  adminUser: loadAdminUser(),
  isAdmin: !!loadAdminUser(),
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
      state.adminUser = null
      state.isAdmin = false
      window.localStorage.removeItem('games-auth-user')
      window.localStorage.removeItem('games-admin-user')
    },
    adminLogin: (state, action) => {
      state.adminUser = action.payload
      state.isAdmin = true
      window.localStorage.setItem('games-admin-user', JSON.stringify(action.payload))
    },
    adminLogout: (state) => {
      state.adminUser = null
      state.isAdmin = false
      window.localStorage.removeItem('games-admin-user')
    },
  },
})

export const { loginSuccess, logout, adminLogin, adminLogout } = authSlice.actions
export default authSlice.reducer
