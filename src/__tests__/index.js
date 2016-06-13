jest.unmock('../');
import Pusher, { setPusherClient } from '../';
import { shallow } from 'enzyme';
import React from 'react';

let comp, props, channelMock, pusherMock;
const channel = 'foo';
const event = 'bar';

describe('Pusher', () => {
  beforeEach(() => {
    channelMock = {
      bind: jasmine.createSpy('bind'),
      unbind: jasmine.createSpy('unbind'),
    };

    pusherMock = {
      subscribe: jasmine.createSpy('subscribe').and.returnValue(channelMock),
      unsubscribe: jasmine.createSpy('unsubscribe'),
      channels: {
        find: jasmine.createSpy('find'),
      },
    };

    props = {
      channel,
      event,
      onUpdate: jasmine.createSpy('onUpdate'),
    };
  });

  describe('without pusherClient', () => {
    it('throws an error if no pusherClient is set when component is mounted', () => {
      const render = () => shallow(<Pusher {...props} />);
      expect(render).toThrow();
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


    it('renders nothing but a noscript tag', () => {
      comp = shallow(<Pusher {...props} />);
      expect(comp.html()).toEqual('<noscript></noscript>');
    });

    describe('on initialisation', () => {
      it('calls pusher.channels.find to get a pre-existing channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.channels.find).toHaveBeenCalledWith(channel);
      });

      it('calls pusher.subscribe if pusherMock.channels.find does not return a channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.subscribe).toHaveBeenCalledWith(channel);
      });

      it('does not call pusherMock.subscribe pusher.channels.find finds a channel', () => {
        pusherMock.channels.find.and.returnValue(channelMock);
        comp = shallow(<Pusher {...props} />);
        expect(pusherMock.subscribe).not.toHaveBeenCalled();
      });

      it('subscribes to channel and binds this.onUpdate to channel', () => {
        comp = shallow(<Pusher {...props} />);
        expect(channelMock.bind).toHaveBeenCalledWith(event, props.onUpdate);
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
        expect(channelMock.unbind).toHaveBeenCalledWith(event, props.onUpdate);
      });

      it('automatically unsubscribes from channel when channel counter is 0', () => {
        comp = shallow(<Pusher {...props} />);
        const comp2 = shallow(<Pusher {...props} />);
        comp2.unmount();
        comp.unmount();
        expect(pusherMock.unsubscribe).toHaveBeenCalledWith(channel);
      });

      it("doesn't unsubscribe from channel when channel counter is still above 0", () => {
        comp = shallow(<Pusher {...props} />);
        shallow(<Pusher {...props} />);
        comp.unmount();
        expect(pusherMock.unsubscribe).not.toHaveBeenCalled();
        expect(Pusher.channels[channel]).toBe(1);
      });
    });

    it('unbinds old event combo and binds new event,' +
      ' unsubscribes from old channel if nobody subscribes to it', () => {
      comp = shallow(<Pusher {...props} />);
      expect(pusherMock.subscribe).toHaveBeenCalledWith(channel);
      expect(channelMock.bind).toHaveBeenCalledWith(event, props.onUpdate);
      const newChannel = 'newChannel';
      const newEvent = 'newEvent';
      comp.setProps({ channel: newChannel, event: newEvent });
      jest.runAllTimers();
      jest.runAllTicks();
      expect(pusherMock.unsubscribe).toHaveBeenCalledWith(channel);
      expect(channelMock.unbind).toHaveBeenCalledWith(event, props.onUpdate);
      expect(pusherMock.subscribe).toHaveBeenCalledWith(newChannel);
      expect(channelMock.bind).toHaveBeenCalledWith(newEvent, props.onUpdate);
    });
  });
});
