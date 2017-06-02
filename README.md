# thunk-kickoff
### The easiest way to get promises out the door and into your store!

thunk-kickoff is a set of functions that take care of everything you should do when calling an async promise and loading the result into your redux store. It's not another redux middleware because it doesn't have to be. Instead, it builds on top of redux-thunk, a redux middleware that adds support for action creators that return a function instead of an action. Lets see a basic usage...

## Basic Usage

```js
import tk from 'thunk-kickoff'

// I've got a promise, and I'd like to load it into the store.
const promise = () => fetch("https://xkcd.com/info.0.json", { method: "GET" }).then(r => r.json())

const store = {
    xkcd: loadStore({
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
    loadXkcd: () => tk.load(LOAD_XKCD, promise(), {
        // format the data to whatever you'd like
        format: data => ({
            safeTitle: data.safe_title,
            image: data.img,
            date: new Date(data.year, data.month, data.day),
            issue: data.num
        })
    })
}

const reducer = (state = store, action) => {
    if(LOAD_XKCD) {
        return {...state, xkcd: tk.reducer(state.xkcd, action)}
    }
    return state
}

const selectors = {
    isXkcdLoaded: state => tk.selectors.isSuccess(state.xkcd),
    getXkcdData: state => tk.selectors.getData(state.xkcd)
}
```

But I thought you said type safety?

```ts
import * as tk from 'thunk-kickoff'

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

interface Store {
    xkcd: tk.Store<Xkcd>
    // oatmeal: ...
    // dinosaurComics: ...
}

const store = {
    xkcd: loadStore({
        safeTitle: "",
        image: "",
        date: new Date(),
        issue: -1
    }),
}

// define a redux action type
interface LoadXkcd extends tk.LoadAction<Xkcd> { 
    type: "comics_xkcd_load"
}

interface ActionCreators {
    loadXkcd: () => ThunkAction<void, Store, null>
}

const actions: ActionCreators = {
    loadXkcd: () => tk.load<Store, XkcdResponse, Xkcd>("comics_xkcd_load", promise(), {
        // format the data to whatever you'd like
        format: data => ({
            safeTitle: data.safe_title,
            image: data.img,
            date: new Date(data.year, data.month, data.day),
            issue: data.num
        })
    })
}

const reducer = (state = store, action) => {
    if("comics_xkcd_load") {
        return {...state, xkcd: tk.reducer(state.xkcd, action)}
    }
    return state
}

interface Selectors {
    isXkcdLoaded: (state: Store) => boolean
    getXkcdData: (state: Store) => Xkcd
}

const selectors: Selectors = {
    isXkcdLoaded: state => tk.selectors.isSuccess(state.xkcd),
    getXkcdData: state => tk.selectors.getData(state.xkcd)
}
```