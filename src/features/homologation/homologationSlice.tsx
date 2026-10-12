import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface homologationState {
  homologationData: {} ,
  requestId : string ,
  formFeildsLength: {},
  Category: string
  
}


const initialState: homologationState = {
  homologationData: {},
  requestId: '' ,
  formFeildsLength: {},
  Category: '' 
}

export const homologationSlice = createSlice({
  name: 'homologation',
  initialState,
  reducers: {
    setHomologationDatas: (state, action: PayloadAction<{} | homologationState>) => {
      state.homologationData = action.payload
    },
    setformFeildsLength: (state, action: PayloadAction<{} | homologationState>) => {
      state.formFeildsLength = action.payload
    },
    setRequestId: (state, action: PayloadAction<string>) => {
      state.requestId = action.payload
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.Category = action.payload
    }
    
  },
})

// Action creators are generated for each case reducer function
export const { 
  setHomologationDatas, 
  setRequestId, 
  setformFeildsLength,
  setCategory

} = homologationSlice.actions

export default homologationSlice.reducer