export interface StateType{
    darkMode : boolean,
}

export type ActionType =
  | { type: "LIGHT" }
  | { type: "DARK" }
  | { type: "TOGGLE" }

export const darkModeReducer  = (state: StateType , action : ActionType)=>{
    switch (action.type) {
        case 'LIGHT':
            return {
                darkMode : false
            }
        case 'DARK':
            return {
                darkMode : true
            }
        case 'TOGGLE':
            return{
                darkMode : !state.darkMode
            }
        default:
            return state
    }
}