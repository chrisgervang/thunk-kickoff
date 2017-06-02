import * as Redux from 'redux';
import { ThunkAction } from 'redux-thunk';
export declare type Status = 'pending' | 'success' | 'fail';
/** kickoff state to store data and request status */
export interface State<T> {
    data: T;
    status: Status;
    error?: string;
}
export interface ReducerOptions {
    /** decide which statuses update the data object in the reducer. default: ['success'] */
    changeDataOn: Status[];
}
/** kickoff action to dispatch promise results */
export interface Action<T> extends Redux.Action {
    type: string;
    data: T;
    status: Status;
    error?: string;
}
export declare type ActionCreatorCallback<Format, State> = (dispatch: Redux.Dispatch<State>, getState: () => State, data: Format) => void;
export interface ActionCreatorOptions<R, State, Format = R> {
    /** continue the thunk on success to chain actions that depend on a success */
    onSuccess: ActionCreatorCallback<Format, State>;
    /** continue the thunk on pening to chain actions that depend on a pending */
    onPending: ActionCreatorCallback<Format, State>;
    /** continue the thunk on fail to chain actions that respond to a fail */
    onFail: ActionCreatorCallback<Format, State>;
    /** optional default response data that will be inserted in the store when changeDataOn contains 'pending' or 'fail' */
    defaultResponse: R;
    /** convert the response object into your prefered object */
    format: (data: R) => Format;
}
/** state object initializer */
export declare function state<T>(data: T): State<T>;
export declare function reducer<T>(state: State<T>, action: Action<T>, options?: Partial<ReducerOptions>): State<T>;
/** basic helper functions to pull out of the kickoff store */
export declare const selectors: {
    getRequest: <Format>(state: State<Format>) => {
        status: Status;
        error: string;
    };
    getStatus: <Format>(state: State<Format>) => Status;
    getData: <Format>(state: State<Format>) => Format;
    isSuccess: <Format>(state: State<Format>) => boolean;
    isFail: <Format>(state: State<Format>) => {
        failed: boolean;
        why: string;
    };
    isPending: <Format>(state: State<Format>) => boolean;
};
export declare type WrapCreator<State> = (dispatch: Redux.Dispatch<State>, getState: () => State) => void;
/** redux-thunk wrapper for calling an async function */
export declare function wrap<State>(creator: WrapCreator<State>): ThunkAction<void, State, null>;
/** action creator for kicking off a promise and loading it into the store */
export default function kickoff<State, R, Format = R, S extends string = string>(type: S, endpoint: Promise<R>, options?: Partial<ActionCreatorOptions<R, State, Format>>): ThunkAction<void, State, null>;
