// import { createSlice } from '@reduxjs/toolkit'
// import type { PayloadAction } from '@reduxjs/toolkit'

// export interface loginCredentialState {
//   userData: {}
//   token: string
//   forgotPassword: {}
//   firstTimeLogin : boolean,
//   passwordChanged :boolean,
//   checkResetPassword: boolean
// }


// const initialState: loginCredentialState = {
//   userData: {},
//   token: '',
//   forgotPassword: {},
//   firstTimeLogin: false,
//   passwordChanged :false,
//   checkResetPassword: false
// }

// export const loginSlice = createSlice({
//   name: 'loginCredential',
//   initialState,
//   reducers: {
//     setUserData: (state, action: PayloadAction<{} | loginCredentialState>) => {
//       state.userData = action.payload
//     },
//     setToken: (state, action: PayloadAction<string>) => {
//       state.token = action.payload
//     },
//     setPassword: (state, action: PayloadAction<{} | loginCredentialState>) => {
//       state.forgotPassword = action.payload
//     },
//     setFirstTimeLogin: (state, action: PayloadAction<boolean>) => {
//       state.firstTimeLogin = action.payload
//     },
//     setPasswordChanged: (state, action: PayloadAction<boolean>) => {
//       state.passwordChanged = action.payload
//     },
//     setResetPassword: (state, action: PayloadAction<boolean>) => {
//       state.passwordChanged = action.payload
//     },
//     logout: state => {
//     }
//   },
// })

// // Action creators are generated for each case reducer function
// export const { 
//   setUserData, 
//   setToken,
//   setPassword,
//   setFirstTimeLogin,
//   logout,
//   setPasswordChanged,
//   setResetPassword

// } = loginSlice.actions

// export default loginSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface loginCredentialState {
  userData: {}
  token: string
  forgotPassword: {}
  firstTimeLogin : boolean,
  passwordChanged :boolean,
  checkResetPassword: boolean,
  vehicleType: string
}


const initialState: loginCredentialState = {
  userData: {},
  token: '',
  forgotPassword: {},
  firstTimeLogin: false,
  passwordChanged :false,
  checkResetPassword: false,
  vehicleType: '',//It keeps all login-related data in a central place
}

export const loginSlice = createSlice({
  name: 'loginCredential',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{} | loginCredentialState>) => {
      state.userData = action.payload
    },
    
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setPassword: (state, action: PayloadAction<{} | loginCredentialState>) => {
      state.forgotPassword = action.payload
    },
    setFirstTimeLogin: (state, action: PayloadAction<boolean>) => {
      state.firstTimeLogin = action.payload
    },
    setPasswordChanged: (state, action: PayloadAction<boolean>) => {
      state.passwordChanged = action.payload
    },
    setResetPassword: (state, action: PayloadAction<boolean>) => {
      state.passwordChanged = action.payload
    },
    setVehicleType: (state, action: PayloadAction<string>) => {
      state.vehicleType = action.payload;
    },
    logout: state => {
    }
  },
})

// Action creators are generated for each case reducer function
export const { 
  setUserData, 
  setToken,
  setPassword,
  setFirstTimeLogin,
  logout,
  setPasswordChanged,
  setResetPassword,
  setVehicleType

} = loginSlice.actions

export default loginSlice.reducer