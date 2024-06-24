import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { authReducer } from './state';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from 'redux-persist/integration/react';

/* SET UP REDUX WITH PERSIST: https://stackoverflow.com/questions/63761763/how-to-configure-redux-persist-with-redux-toolkit */
// use local storage to persist state
const persistConfig = {key: "mern_mmo_render", storage, version: 1};
// ensure the reducer saves state to persisted storage
const persistedReducer = persistReducer(persistConfig, authReducer);
const store = configureStore({
  reducer: persistedReducer,
  // get rid of warnings
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});
const persistor = persistStore(store);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
        <Provider store={store}>
      {/* PersistGate delays rendering until persisted state is retrieved and saved; loading 
      is what should be rendered while loading; persistor will handle persisting the state*/}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
