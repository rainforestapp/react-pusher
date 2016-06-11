jest.dontMock('../index');
jest.dontMock('../../../pusher');
jest.dontMock('../../../config');

const Pusher = require('../index');
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import React from 'react';
const PusherApi = require('../../../pusher');
let component, pusherChannel = null;
const onUpdateSpy = jasmine.createSpy('onUpdate');

describe('Pusher', () => {
  beforeEach(() => {
    Pusher.channels = Map();
    pusherChannel = jasmine.createSpyObj('channel', ['bind', 'unbind']);
    spyOn(PusherApi, 'subscribe').and.returnValue(pusherChannel);
    spyOn(PusherApi, 'unsubscribe');
    onUpdateSpy.calls.reset();
    component = shallow(<Pusher channel="test" event="log" onUpdate={onUpdateSpy} />);
  });

  it('subscribes on mount', () => {
    expect(PusherApi.subscribe).toHaveBeenCalledWith('test');
  });

  it('binds event properly', () => {
    expect(pusherChannel.bind).toHaveBeenCalledWith('log', component.instance().onUpdate);
  });

  describe('on change props', () => {
    beforeEach(() => {
      pusherChannel.unbind.calls.reset();
      pusherChannel.bind.calls.reset();
      PusherApi.unsubscribe.calls.reset();
      PusherApi.subscribe.calls.reset();
    });

    it('rebinds on event change', () => {
      component.setProps({ event: 'new_test' });
      expect(pusherChannel.unbind).toHaveBeenCalledWith('log', component.instance().onUpdate);
      expect(pusherChannel.bind).toHaveBeenCalledWith('new_test', component.instance().onUpdate);
      expect(PusherApi.unsubscribe).not.toHaveBeenCalled();
    });

    it('unsubscribes fully and rebinds on channel change', () => {
      component.setProps({ event: 'new_test', channel: 'channel_new' });
      expect(pusherChannel.unbind).toHaveBeenCalledWith('log', component.instance().onUpdate);
      expect(pusherChannel.bind).toHaveBeenCalledWith('new_test', component.instance().onUpdate);
      expect(PusherApi.unsubscribe).toHaveBeenCalledWith('test');
      expect(PusherApi.subscribe).toHaveBeenCalledWith('channel_new');
    });
  });

  it('unsubscribes only when necessary', () => {
    const anotherComponent = shallow(<Pusher channel="test" event="log" onUpdate={onUpdateSpy} />);

    component.instance().componentWillUnmount();

    expect(pusherChannel.unbind).toHaveBeenCalledWith('log', component.instance().onUpdate);
    expect(PusherApi.unsubscribe).not.toHaveBeenCalled();

    pusherChannel.unbind.calls.reset();

    anotherComponent.instance().componentWillUnmount();

    expect(pusherChannel.unbind).toHaveBeenCalledWith('log', anotherComponent.instance().onUpdate);
    expect(PusherApi.unsubscribe).toHaveBeenCalledWith('test');
  });
});
