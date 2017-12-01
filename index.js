import React, { Component } from 'react';
import T from 'prop-types'

export default class Pusher extends Component {
  static propTypes = {
    channel: T.string.isRequired,
    onUpdate: T.func.isRequired,
    event: T.string.isRequired,
  };

  static pusherClient = null;
  static channels = {};

  constructor(props) {
    super(props);
    if (!Pusher.pusherClient) {
      throw new Error('you must set a pusherClient by calling setPusherClient');
    }
  }

  componentWillMount() {
    this.bindPusherEvent(this.props.channel, this.props.event);
  }

  componentWillReceiveProps({ channel: newChannel, event: newEvent }) {
    const { channel, event } = this.props;
    if (channel === newChannel && event === newEvent) {
      return;
    }

    this.unbindPusherEvent(channel, event);
    this.bindPusherEvent(newChannel, newEvent);
  }

  componentWillUnmount() {
    this.unbindPusherEvent(this.props.channel, this.props.event);
  }

  unbindPusherEvent(channel, event) {
    const pusherChannel = Pusher.pusherClient.channels.find(channel);
    if (pusherChannel) {
      pusherChannel.unbind(event, this.props.onUpdate);
    }

    Pusher.channels[channel]--;
    if (Pusher.channels[channel] <= 0) {
      delete Pusher.channels[channel];
      Pusher.pusherClient.unsubscribe(channel);
    }
  }

  bindPusherEvent(channel, event) {
    const pusherChannel =
      Pusher.pusherClient.channels.find(channel)
      || Pusher.pusherClient.subscribe(channel);
    pusherChannel.bind(event, this.props.onUpdate);

    if (Pusher.channels[channel] === undefined) Pusher.channels[channel] = 0;
    Pusher.channels[channel]++;
  }

  render() {
    return <noscript />;
  }
}

export const setPusherClient = (pusherClient) => { Pusher.pusherClient = pusherClient; };
