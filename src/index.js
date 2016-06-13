import React, { Component, PropTypes as T } from 'react';

export default class Pusher extends Component {
  static propTypes = {
    channel: T.string.isRequired,
    onUpdate: T.func.isRequired,
    event: T.string.isRequired,
  };

  static pusherClient = null;
  static channels = {};

  constructor(props) {
    if (!Pusher.pusherClient) {
      throw new Error('you must set a pusherClient by calling setPusherClient');
    }

    super(props);
    this.bindPusherEvent(props.channel, props.event);
  }

  componentWillReceiveProps({ channel: newChannel, event: newEvent }) {
    const { channel, event } = this.props;
    if (channel === newChannel && event === newEvent) {
      return;
    }

    this.bindPusherEvent(newChannel, newEvent);
    this.unbindPusherEvent(channel, event);
  }

  componentWillUnmount() {
    this.unbindPusherEvent(this.props.channel, this.props.event);
  }

  unbindPusherEvent(channel, event) {
    this._channel.unbind(event, this.props.onUpdate);
    Pusher.channels[channel]--;

    if (Pusher.channels[channel] <= 0) {
      delete Pusher.channels[channel];
      Pusher.pusherClient.unsubscribe(channel);
    }
  }

  bindPusherEvent(channel, event) {
    this._channel =
      Pusher.pusherClient.channels.find(channel)
      || Pusher.pusherClient.subscribe(channel);
    this._channel.bind(event, this.props.onUpdate);

    if (Pusher.channels[channel] === undefined) Pusher.channels[channel] = 0;
    Pusher.channels[channel]++;
  }

  _channel = null;

  render() {
    return <noscript />;
  }
}

export const setPusherClient = (pusherClient) => { Pusher.pusherClient = pusherClient; };
