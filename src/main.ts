import * as Redux from 'redux'
import { ThunkAction } from 'redux-thunk'

export type Status = 'pending' | 'success' | 'fail'

export interface Request {
    
}

export interface Store<T> {
    data: T
    status: Status
    error?: string
}

export function store<T> (data: T): Store<T> {
    return {
        status: "pending",
        data
    }
}

export interface Action<T> extends Redux.Action {
    type: string
    status: Status
    error?: string
    data: T
}

type Creator<State> = (dispatch: Redux.Dispatch<State>, getState: () => State) => void

export function wrap<State> (creator: Creator<State>): ThunkAction<void, State, null> {
  return (dispatch, getState) => {
    /** define and then call an async function */
    (async (dispatch, getState) => {
      await creator(dispatch, getState)
    })(dispatch, getState)
  }
}

type Callback<Format, State> = (dispatch: Redux.Dispatch<State>, getState: () => State, data: Format) => void

interface ActionCreatorOptions<R, State, Format = R> {
  onSuccess: Callback<Format, State>
  onPending: Callback<Format, State>
  onFail: Callback<Format, State>
  defaultResponse: R
  format: (data: R) => Format
}

export function load<State, R, Format = R, S extends string = string>(type: S, endpoint: Promise<R>, options?: Partial<ActionCreatorOptions<R, State, Format>>) {  
  const defaultActionCreatorOptions: Partial<ActionCreatorOptions<R, State>> = {
    defaultResponse: undefined,
    format: data => data
  }

  if(!options) options = defaultActionCreatorOptions as any

  return wrap<State>(async (dispatch, getState) => {
    const data = !!options.defaultResponse ? options.format(options.defaultResponse) : null 
    dispatch<Action<Format>>({ type, status: "pending", data})
    if(!!options.onPending) options.onPending(dispatch, getState, data)

    await endpoint.then( data => {
      dispatch<Action<Format>>({ type, status: "success", data: options.format(data) })
      if(!!options.onSuccess) options.onSuccess(dispatch, getState, options.format(data))

    }, why => {
      dispatch<Action<Format>>({type, status: "fail", error: why, data})
      if(!!options.onFail) options.onFail(dispatch, getState, data)
      console.error(why)
    })
  })
}

interface ReducerOptions {
  changeDataOn: Status[]
}

const defaultReducerOptions: Partial<ReducerOptions> = {
  changeDataOn: ['success']
}

export function reducer<T>(state: Store<T>, action: Action<T>, options: Partial<ReducerOptions> = defaultReducerOptions): Store<T> {
  if(options.changeDataOn.some(s => s === action.status)) {
    return {...state, data: action.data, status: action.status, error: action.error}
  } else {
    return {...state, status: action.status, error: action.error}
  }
}

export function getRequest<Format>(state: Store<Format>) {
  return { status: state.status, error: state.error }
}

export function getStatus<Format>(state: Store<Format>) {
  return state.status
}

export function isSuccess<Format>(state: Store<Format>) {
  return state.status === "success"
}

export function isFail<Format>(state: Store<Format>) {
  return { failed: state.status === "fail", why: state.error }
}

export function isPending<Format>(state: Store<Format>) {
  return state.status === "pending"
}