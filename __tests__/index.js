jest.unmock('../');
import Pusher, { setPusherClient } from '../';
import { shallow } from 'enzyme';
import React from 'react';

let comp, props, channels, pusherMock;
const channel = 'foo';
const event = 'test-event';

describe('Pusher', () => {
  beforeEach(() => {
    channels = [
      { name: 'foo', bind: jest.fn(), unbind: jest.fn() },
      { name: 'bar', bind: jest.fn(), unbind: jest.fn() },
    ];

    let subscribedChannels = [];

    const findChannel = channelName =>
      channels.find(({ name }) => name === channelName);

    pusherMock = {
      subscribe: jest.fn().mockImplementation(channelName => {
        const ch = channels.find(({ name }) => name === channelName);
        if (!ch) {
          return ch;
        }
        subscribedChannels.push(ch);
        return ch;
      }),
      unsubscribe: jest.fn().mockImplementation(channelName => {
        subscribedChannels = subscribedChannels.filter(({ name }) => name === channelName);
      }),
      channels: {
        find: jest.fn().mockImplementation(channelName => 
          subscribedChannels.find(({ name }) => channelName === name)
        ),
      },
    };

    props = {
      channel,
      event,
      onUpdate: jest.fn(),
    };
  });

  describe('without pusherClient', () => {
    it('throws an error if no pusherClient is set when component is mounted', () => {
      expect(() => shallow(<Pusher {...props} />)).toThrow();
    });
  });

  describe('with pusherClient', () => {
    beforeEach(() => {
      setPusherClient(pusherMock);
    });

    afterEach(() => {
      comp.unmount();
      Pusher.channels = {};
    });


    it('renders nothing', () => {
      comp = shallow(<Pusher {...props} />);
      expect(comp.isEmptyRender()).toBeTruthy();
    });

    describe('on initialisation', () => {
      it('calls pusher.channels.find to get a pre-existing channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.channels.find).toBeCalledWith(channel);
      });

      it('calls pusher.subscribe if pusherMock.channels.find does not return a channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.subscribe).toBeCalledWith(channel);
      });

      it('does not call pusherMock.subscribe if pusher.channels.find finds a channel', () => {
        pusherMock.subscribe(channel);
        pusherMock.subscribe.mockClear();
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.channels.find).toBeCalledWith(channel);
        expect(pusherMock.subscribe).not.toBeCalled();
      });

      it('subscribes to channel and binds this.onUpdate to channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(channels[0].bind).toBeCalledWith(event, props.onUpdate);
      });

      it('increments the channel counter when component is mounted,' +
         ' and decrements the counter when component is unmounted', () => {
        comp = shallow(<Pusher {...props} />);
        expect(Pusher.channels[channel]).toBe(1);
        const comp2 = shallow(<Pusher {...props} />);
        expect(Pusher.channels[channel]).toBe(2);
        comp2.unmount();
        expect(Pusher.channels[channel]).toBe(1);
      });

      it('calls channel.unbind when component is unmounted', () => {
        comp = shallow(<Pusher {...props} />);
        comp.unmount();
        expect(channels[0].unbind).toBeCalledWith(event, props.onUpdate);
      });

      it('automatically unsubscribes from channel when channel counter is 0', () => {
        comp = shallow(<Pusher {...props} />);
        const comp2 = shallow(<Pusher {...props} />);
        comp2.unmount();
        comp.unmount();
        expect(pusherMock.unsubscribe).toBeCalledWith(channel);
      });

      it("doesn't unsubscribe from channel when channel counter is still above 0", () => {
        comp = shallow(<Pusher {...props} />);
        shallow(<Pusher {...props} />);
        comp.unmount();
        expect(pusherMock.unsubscribe).not.toBeCalled();
        expect(Pusher.channels[channel]).toBe(1);
      });
    });

    it('unbinds old event combo and binds new event,' +
      ' unsubscribes from old channel if nobody subscribes to it', () => {
      comp = shallow(<Pusher {...props} />);
      expect(pusherMock.subscribe).toBeCalledWith(channel);
      expect(channels[0].bind).toBeCalledWith(event, props.onUpdate);
      const newChannel = 'bar';
      const newEvent = 'newEvent';
      comp.setProps({ channel: newChannel, event: newEvent });
      jest.runAllTimers();
      jest.runAllTicks();
      expect(pusherMock.unsubscribe).toBeCalledWith(channel);
      expect(channels[0].unbind).toHaveBeenCalledWith(event, props.onUpdate);
      expect(pusherMock.subscribe).toHaveBeenCalledWith(newChannel);
      expect(channels[1].bind).toHaveBeenCalledWith(newEvent, props.onUpdate);
    });
  });
});
