import * as Redux from 'redux';
import { ThunkAction } from 'redux-thunk';
export declare type Status = 'pending' | 'success' | 'fail';
export interface State<T> {
    data: T;
    status: Status;
    error?: string;
}
export declare function state<T>(data: T): State<T>;
export interface ReducerOptions {
    changeDataOn: Status[];
}
export declare function reducer<T>(state: State<T>, action: Action<T>, options?: Partial<ReducerOptions>): State<T>;
export interface Action<T> extends Redux.Action {
    type: string;
    status: Status;
    error?: string;
    data: T;
}
export declare type ActionCreatorCallback<Format, State> = (dispatch: Redux.Dispatch<State>, getState: () => State, data: Format) => void;
export interface ActionCreatorOptions<R, State, Format = R> {
    onSuccess: ActionCreatorCallback<Format, State>;
    onPending: ActionCreatorCallback<Format, State>;
    onFail: ActionCreatorCallback<Format, State>;
    defaultResponse: R;
    format: (data: R) => Format;
}
export declare const selectors: {
    getRequest: <Format>(state: State<Format>) => {
        status: Status;
        error: string;
    };
    getStatus: <Format>(state: State<Format>) => Status;
    isSuccess: <Format>(state: State<Format>) => boolean;
    isFail: <Format>(state: State<Format>) => {
        failed: boolean;
        why: string;
    };
    isPending: <Format>(state: State<Format>) => boolean;
};
export declare type WrapCreator<State> = (dispatch: Redux.Dispatch<State>, getState: () => State) => void;
export declare function wrap<State>(creator: WrapCreator<State>): ThunkAction<void, State, null>;
export default function kickoff<State, R, Format = R, S extends string = string>(type: S, endpoint: Promise<R>, options?: Partial<ActionCreatorOptions<R, State, Format>>): ThunkAction<void, State, null>;
