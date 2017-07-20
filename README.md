# thunk-kickoff
### Get promises out the door and into your store!
Use thunk-kickoff to expose the request status for all asynchronous data in your store. A must-have if you're building user interfaces with redux-thunk, connected react components, and api endpoints. I primarily use this to simply loading indicator and error interface implementations, as well as ensuring the program logs are rich with meaningful redux actions for debugging purposes.

## Features

- Easily dispatch more actions in response to status changes.
- Reformat the response json before its added to the store.
- Fine tune performance by controlling which status changes cause a dispatch.
- Significantly reduces boiler plate in your reducer, action creator, selector, and store definition. 

```
npm install --save thunk-kickoff
```

## Motivation

Thunk Kickoff wraps async actions with request status (`success`, `pending`, `fail`), and provides essential request lifecycle functions. It builds on top of redux-thunk.

## API Reference

[Full refernce maintained in declaration file](https://github.com/chrisgervang/thunk-kickoff/blob/master/dist/main.d.ts)

## Basic Usage

### JavaScript

```js
import ko from 'thunk-kickoff'
import { myPromise } from 'some/api'
import { store } from 'some/redux/store'

const init = kickoff.state({
    // initialize
}),

// action
const LOAD = "load"

const thunkAction = () => ko.kickoff(LOAD, myPromise())

// ... for this to work you need to reduce the action onto the store

const reducer = (state = init, action) => ko.reducer(state, action)

// load the promise

store.dispatch(thunkAction())

// check status and get data

const state = store.getState()
const status = ko.selectors.getStatus(state)
const data = ko.selectors.getData(state)
```

### TypeScript

```ts
import * as ko from 'thunk-kickoff'
import { myPromise, ResponseType } from 'some/api'
import { store } from 'some/redux/store'

type State = ko.State<ResponseType>

const init: State = ko.state({
    // initialize
}),

// action
interface Load extends ko.Action<ResponseType> { 
    type: "load"
}

const thunkAction = () => ko.kickoff<State, ResponseType>("load", myPromise())

// for this to work you need to reduce the action onto the store

const reducer = (state: State = init, action) => ko.reducer(state, action)

// load the promise

store.dispatch(thunkAction())

// check status and get data

const state = store.getState()
const status = ko.selectors.getStatus(state)
const data = ko.selectors.getData(state)
```

## Full Example

```js
import ko from 'thunk-kickoff'

// I've got a promise, and I'd like to load it into the store.
const promise = () => fetch("https://xkcd.com/info.0.json", { method: "GET" }).then(r => r.json())

const init = {
    xkcd: ko.state({
        safeTitle: "",
        image: "",
        date: new Date(),
        issue: -1
    }),
    // oatmeal: ...
    // dinosaurComics: ...
}

// define a redux action type
const LOAD_XKCD = "comics_xkcd_load"

const actions = {
    loadXkcd: () => ko.kickoff(LOAD_XKCD, promise(), {
        // format the data to whatever you'd like
        format: data => ({
            safeTitle: data.safe_title,
            image: data.img,
            date: new Date(data.year, data.month, data.day),
            issue: data.num
        })
    })
}

const reducer = (state = init, action) => {
    if(action.type === LOAD_XKCD) {
        return {...state, xkcd: ko.reducer(state.xkcd, action)}
    }
    return state
}

const selectors = {
    isXkcdLoaded: state => ko.selectors.isSuccess(state.xkcd),
    getXkcdData: state => ko.selectors.getData(state.xkcd)
}
```

But I thought you said type safety? Typescript Example:

```ts
import * as ko from 'thunk-kickoff'

interface XkcdResponse {
    month: string
    num: number
    link: string
    year: string
    news: string
    safe_title: string
    transcript: string
    alt: string
    img: string
    title: string
    day: string
}

// I've got a promise, and I'd like to load it into the store.
const promise = () => fetch("https://xkcd.com/info.0.json", { method: "GET" }).then(r => r.json() as XkcdResponse) 

interface Xkcd {
    safeTitle: string
    image: string
    date: Date
    issue: number
}

interface State {
    xkcd: ko.State<Xkcd>
    // oatmeal: ...
    // dinosaurComics: ...
}

const init: State = {
    xkcd: ko.state({
        safeTitle: "",
        image: "",
        date: new Date(),
        issue: -1
    }),
}

// define a redux action type
interface LoadXkcd extends ko.Action<Xkcd> { 
    type: "comics_xkcd_load"
}

interface ActionCreators {
    loadXkcd: () => ThunkAction<void, Store, null>
}

const actions: ActionCreators = {
    loadXkcd: () => ko.kickoff<State, XkcdResponse, Xkcd>("comics_xkcd_load", promise(), {
        // format the data to whatever you'd like
        format: data => ({
            safeTitle: data.safe_title,
            image: data.img,
            date: new Date(data.year, data.month, data.day),
            issue: data.num
        })
    })
}

const reducer = (state: State = init, action) => {
    if(action.type === "comics_xkcd_load") {
        return {...state, xkcd: ko.reducer(state.xkcd, action)}
    }
    return state
}

const selectors = {
    isXkcdLoaded: (state: Store) => ko.selectors.isSuccess(state.xkcd),
    getXkcdData: (state: Store) => ko.selectors.getData(state.xkcd)
}
```
