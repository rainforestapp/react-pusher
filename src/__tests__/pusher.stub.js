import emitter from 'event-emitter';

class Pusher {
  channels = {};

  constructor(appKey, config) {
    this.appKey = appKey;
    if (config) this.config = config;
  }

  subscribe(channelName) {
    if (this.channels[channelName]) {
      return this.channels[channelName];
    }

    this.channels[channelName] = new Channel(channelName); 
    return this.channels[channelName];
  }

  unsubscribe(channelName)

  trigger(channelName, eventName, data) {

  }
}

class Channel {
  constructor(channelName) {
    this.channelName = 'channelName';
    this.channel = emitter({});
  }

  bind(fn) {
    this.channel.on(fn);
    return this;
  }

  unbind() {
  }

  send(message) {
    this.channel.emit({data: message});
  }
}
