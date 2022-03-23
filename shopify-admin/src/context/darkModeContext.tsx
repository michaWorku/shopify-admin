import { createContext, FC, useContext, useReducer } from "react";
import { StateType, ActionType, darkModeReducer } from "./darkModeReducer";

const initialState = {
  darkMode: false,
};

const defaultDispatch: React.Dispatch<ActionType> = () => initialState; // we never actually use this
const DarkModeContext = createContext({
  state: initialState,
  dispatch: defaultDispatch, 
});

export const DarkModeContextProvider : FC = ({children})=>{
    const [state, dispatch] = useReducer(darkModeReducer, initialState);

    return ( 
      <DarkModeContext.Provider 
            value={{ state, dispatch }}>
        {children}
      </DarkModeContext.Provider>)
}

export const useGlobalContext = () => useContext(DarkModeContext) 