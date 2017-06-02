import * as Redux from 'redux'
import { ThunkAction } from 'redux-thunk'

export type Status = 'pending' | 'success' | 'fail'

export interface State<T> {
    data: T
    status: Status
    error?: string
}

export function state<T> (data: T): State<T> {
    return {
        status: "pending",
        data
    }
}

export interface ReducerOptions {
  changeDataOn: Status[]
}

const defaultReducerOptions: Partial<ReducerOptions> = {
  changeDataOn: ['success']
}

export function reducer<T>(state: State<T>, action: Action<T>, options: Partial<ReducerOptions> = defaultReducerOptions): State<T> {
  if(options.changeDataOn.some(s => s === action.status)) {
    return {...state, data: action.data, status: action.status, error: action.error}
  } else {
    return {...state, status: action.status, error: action.error}
  }
}

export interface Action<T> extends Redux.Action {
    type: string
    status: Status
    error?: string
    data: T
}

export type ActionCreatorCallback<Format, State> = (dispatch: Redux.Dispatch<State>, getState: () => State, data: Format) => void

export interface ActionCreatorOptions<R, State, Format = R> {
  onSuccess: ActionCreatorCallback<Format, State>
  onPending: ActionCreatorCallback<Format, State>
  onFail: ActionCreatorCallback<Format, State>
  defaultResponse: R
  format: (data: R) => Format
}

function getRequest<Format>(state: State<Format>) {
  return { status: state.status, error: state.error }
}

function getStatus<Format>(state: State<Format>) {
  return state.status
}

function isSuccess<Format>(state: State<Format>) {
  return state.status === "success"
}

function isFail<Format>(state: State<Format>) {
  return { failed: state.status === "fail", why: state.error }
}

function isPending<Format>(state: State<Format>) {
  return state.status === "pending"
}

export const selectors = {
  getRequest,
  getStatus,
  isSuccess,
  isFail,
  isPending
}

export type WrapCreator<State> = (dispatch: Redux.Dispatch<State>, getState: () => State) => void

export function wrap<State> (creator: WrapCreator<State>): ThunkAction<void, State, null> {
  return (dispatch, getState) => {
    /** define and then call an async function */
    (async (dispatch, getState) => {
      await creator(dispatch, getState)
    })(dispatch, getState)
  }
}

export default function kickoff<State, R, Format = R, S extends string = string>(type: S, endpoint: Promise<R>, options?: Partial<ActionCreatorOptions<R, State, Format>>) {  
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