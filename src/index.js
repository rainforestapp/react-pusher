import React, { Component, PropTypes as T } from 'react';
import bindAll from 'lodash/function/bindAll';
import { Map, Set } from 'immutable';
import PusherApi from '../../pusher';

export default class Pusher extends Component {
  static propTypes = {
    channel: T.string.isRequired,
    onUpdate: T.func.isRequired,
    event: T.string.isRequired,
  };

  constructor(props) {
    super(props);
    bindAll(this, 'onUpdate');

    this.bind(props.channel, props.event);
  }

  componentWillReceiveProps({ channel: newChannel, event: newEvent }) {
    const { channel, event } = this.props;
    if (channel === newChannel && event === newEvent) {
      return;
    }

    this.unbind(channel, event);
    this.bind(newChannel, newEvent);

    if (channel !== newChannel) {
      this.cleanupChannel(channel);
    }
  }

  componentWillUnmount() {
    this.unbind(this.props.channel, this.props.event);
    this.cleanupChannel(this.props.channel);
  }

  unbind(channel, event) {
    this._channel.unbind(event, this.onUpdate);
    Pusher.channels = Pusher.channels.update(channel, Map(), (channelEvents) => {
      let events = channelEvents.update(event, Set(), (handlers) => handlers.delete(this));

      if (events.get(event).size === 0) {
        events = events.delete(event);
      }

      return events;
    });
  }

  cleanupChannel(channel) {
    if (Pusher.channels.get(channel).size === 0) {
      Pusher.channels = Pusher.channels.delete(channel);
      PusherApi.unsubscribe(channel);
    }
  }

  bind(channel, event) {
    this._channel = PusherApi.channels.find(channel) || PusherApi.subscribe(channel);
    this._channel.bind(event, this.onUpdate);

    Pusher.channels = Pusher.channels.update(channel, Map(), (channelEvents) =>
      channelEvents.update(event, Set(), (handlers) => handlers.add(this))
    );
  }

  static channels = Map();
  _channel = null;

  onUpdate(ev) {
    this.props.onUpdate(ev);
  }

  render() {
    return <noscript />;
  }
}
