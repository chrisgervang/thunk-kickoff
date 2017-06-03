import * as Redux from 'redux'
import { ThunkAction } from 'redux-thunk'

export type Status = 'pending' | 'success' | 'fail'

/** kickoff state to store data and request status */
export interface State<T> {
    data: T
    status: Status
    error?: string
}

export interface ReducerOptions {
  /** decide which statuses update the data object in the reducer. default: ['success'] */
  changeDataOn: Status[]
}

/** kickoff action to dispatch promise results */
export interface Action<T> extends Redux.Action {
    type: string
    data: T
    status: Status
    error?: string
}

export type ActionCreatorCallback<Format, State> = (dispatch: Redux.Dispatch<State>, getState: () => State, data: Format) => void

export interface ActionCreatorOptions<R, State, Format = R> {
  /** continue the thunk on success to chain actions that depend on a success */
  onSuccess: ActionCreatorCallback<Format, State>
  /** continue the thunk on pening to chain actions that depend on a pending */
  onPending: ActionCreatorCallback<Format, State>
  /** continue the thunk on fail to chain actions that respond to a fail */
  onFail: ActionCreatorCallback<Format, State>
  /** optional default response data that will be inserted in the store when changeDataOn contains 'pending' or 'fail' */
  defaultResponse: R
  /** convert the response object into your prefered object */
  format: (data: R) => Format
}

/** state object initializer */
export function state<T> (data: T): State<T> {
    return {
        status: "pending",
        data
    }
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

function getRequest<Format>(state: State<Format>) {
  return { status: state.status, error: state.error }
}

function getStatus<Format>(state: State<Format>) {
  return state.status
}

function getData<Format>(state: State<Format>) {
  return state.data
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

/** basic helper functions to pull out of the kickoff store */
export const selectors = {
  getRequest,
  getStatus,
  getData,
  isSuccess,
  isFail,
  isPending
}

export type WrapCreator<State> = (dispatch: Redux.Dispatch<State>, getState: () => State) => void

/** redux-thunk wrapper for calling an async function */
export function wrap<State> (creator: WrapCreator<State>): ThunkAction<void, State, null> {
  return (dispatch, getState) => {
    /** define and then call an async function */
    (async (dispatch, getState) => {
      await creator(dispatch, getState)
    })(dispatch, getState)
  }
}

/** action creator for kicking off a promise and loading it into the store */
export function kickoff<State, R, Format = R, S extends string = string>(type: S, endpoint: Promise<R>, options?: Partial<ActionCreatorOptions<R, State, Format>>) {  
  const defaultOptions: Partial<ActionCreatorOptions<R, State>> = {
    defaultResponse: undefined,
    format: data => data
  }

  if(!options) options = defaultOptions as any
  if(!options.format) options.format = defaultOptions.format as any

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

export default kickoff