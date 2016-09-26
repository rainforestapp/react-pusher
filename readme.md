# React Pusher Component

### A community managed React Component for managing Pusher subscriptions.

**Originally conceived and implemented by [@ziahamza](https://github.com/ziahamza) and [@prayogoa](https://github.com/prayogoa).**

## Usage

You can get `react-pusher` from npm, just run `npm install react-pusher --save`.

1. To use react-pusher, you need to hand over your instance of the pusher service first. Otherwise the Pusher React component can't receive messages:
  ```js
  import { setPusherClient } from 'react-pusher';
  import Pusher from 'pusher-js';
  
  const pusherClient = new Pusher({
    <your_config>...
  });
  
  setPusherClient(pusherClient);
  ```
2. Then you simply mount the component, inside another component of yours. The pusher subscription will stay alive for as long as the component does. It subscribes to events when mounted, and cleans up hanging subscriptions when unmounted.

Here's an example of using pusher-react in combination with redux. Everytime we receive a push notification for channel `"someChannel"` and event `"listChanged"`, the `fetchList()` action is dispatched.

```js
import { fetchList } from './actions';
import store from '../../store';
import Pusher from 'react-pusher';

const SomeList = ({ items }) => (
  <div>
    <ul>
      {items.map((item) => { <span>{item}</span> })}
    </ul>
    <Pusher
      channel="someChannel"
      event="listChanged"
      onUpdate={store.dispatch(fetchList())}
    />
  </div>
);
```

## Rationale

We use pusher at rainforest. Previously our management of pusher notifications was wrapped in it's own service. A singleton, instantiated at app-startup.

Then we __noticed a pattern__ - subscriptions to push notifications are tied to the lifecycle of components that make use of these subscriptions. This is the patttern: In 99% of cases:

1. We want to subscribe to a pusher event stream when a component is mounted.
2. We want to unsubscribe above pusher stream when given component is unmounted.

It made sense to move the management of pusher subscriptions into a React component, so we don't have to manage it ourselves.


## [License: MIT](license.md)
