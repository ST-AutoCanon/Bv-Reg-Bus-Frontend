import { configureStore } from '@reduxjs/toolkit';
import loginSlice from '../features/login/loginSlice';
import homologationSlice from '../features/homologation/homologationSlice';
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  version: 1,
  storage
};

const reducer = combineReducers({
  loginCredential: loginSlice,
  homologation: homologationSlice,
});

const rootReducer = (state:any, action:any) => {
  if (action.type === 'loginCredential/logout') {
    state = undefined;
  }
  return reducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

