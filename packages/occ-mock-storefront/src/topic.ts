import $ from 'jquery';

const observable = $({});

type EventCallback = JQuery.EventHandlerBase<any, any>;

$.Topic = (eventName: string) => ({
  subscribe: (cb: EventCallback) => observable.on(eventName, (_event, data) => cb(data)),
  publish: (...payload: any[]) => observable.trigger(eventName, payload)
});
