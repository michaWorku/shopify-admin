import ReactDOM from "react-dom";
import App from "./App";
import { persistor, store,  } from './app/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { DarkModeContextProvider } from './context/darkModeContext'

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DarkModeContextProvider>
            <App />
          </DarkModeContextProvider>
        </PersistGate>
    </Provider>,
    document.getElementById("root"));

