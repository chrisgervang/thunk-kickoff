# thunk-kickoff
### Get promises out the door and into your store!

```
npm install --save thunk-kickoff
```

## Motivation

Thunk Kickoff wraps async actions with request status (`success`, `pending`, `fail`), and provides essential request lifecycle functions. It builds on top of redux-thunk. Lets see a basic usage...

## Basic Usage

### JavaScript

```js
import kickoff from 'thunk-kickoff'
import { myPromise } from 'api'
import { store } from 'redux/store'

const init = kickoff.state({
    // initialize
}),

// action
const LOAD = "load"

const thunkAction = () => kickoff.kickoff(LOAD, myPromise())

// ... for this to work you need to reduce the action onto the store

const reducer = (state = init, action) => kickoff.reducer(state, action)

// ... to load the promise

store.dispatch(thunkAction())

// ... to check status and get data

const state = store.getState()
const status = kickoff.selectors.getStatus(state)
const data = kickoff.selectors.getData(state)
```

### TypeScript

```ts
import kickoff from 'thunk-kickoff'
import { myPromise, ResponseType } from 'api'
import { store } from 'redux/store'

type State = kickoff.State<ResponseType>

const init = kickoff.state({
    // initialize
}),

// action
interface Load extends kickoff.Action<ResponseType> { 
    type: "load"
}

const thunkAction = () => kickoff<State, ResponseType>("load", myPromise())

// ... for this to work you need to reduce the action onto the store

const reducer = (state = init, action) => kickoff.reducer(state, action)

// ... to load the promise

store.dispatch(thunkAction())

// ... to check status and get data

const state = store.getState()
const status = kickoff.selectors.getStatus(state)
const data = kickoff.selectors.getData(state)
```

## Full Example

```js
import kickoff from 'thunk-kickoff'

// I've got a promise, and I'd like to load it into the store.
const promise = () => fetch("https://xkcd.com/info.0.json", { method: "GET" }).then(r => r.json())

const init = {
    xkcd: kickoff.state({
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
    loadXkcd: () => kickoff(LOAD_XKCD, promise(), {
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
        return {...state, xkcd: kickoff.reducer(state.xkcd, action)}
    }
    return state
}

const selectors = {
    isXkcdLoaded: state => kickoff.selectors.isSuccess(state.xkcd),
    getXkcdData: state => kickoff.selectors.getData(state.xkcd)
}
```

But I thought you said type safety?

```ts
import * as kickoff from 'thunk-kickoff'

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
    xkcd: kickoff.State<Xkcd>
    // oatmeal: ...
    // dinosaurComics: ...
}

const init = {
    xkcd: kickoff.state({
        safeTitle: "",
        image: "",
        date: new Date(),
        issue: -1
    }),
}

// define a redux action type
interface LoadXkcd extends kickoff.Action<Xkcd> { 
    type: "comics_xkcd_load"
}

interface ActionCreators {
    loadXkcd: () => ThunkAction<void, Store, null>
}

const actions: ActionCreators = {
    loadXkcd: () => kickoff<State, XkcdResponse, Xkcd>("comics_xkcd_load", promise(), {
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
    if(action.type === "comics_xkcd_load") {
        return {...state, xkcd: kickoff.reducer(state.xkcd, action)}
    }
    return state
}

const selectors = {
    isXkcdLoaded: (state: Store) => kickoff.selectors.isSuccess(state.xkcd),
    getXkcdData: (state: Store) => kickoff.selectors.getData(state.xkcd)
}
```
