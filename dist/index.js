"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPusherClient = exports["default"] = void 0;

var _react = require("react");

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Pusher =
/*#__PURE__*/
function (_Component) {
  _inherits(Pusher, _Component);

  function Pusher(props) {
    var _this;

    _classCallCheck(this, Pusher);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Pusher).call(this, props));

    if (!Pusher.pusherClient) {
      throw new Error('you must set a pusherClient by calling setPusherClient');
    }

    return _this;
  }

  _createClass(Pusher, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.bindPusherEvent(this.props.channel, this.props.event);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(_ref) {
      var oldChannel = _ref.channel,
          oldEvent = _ref.event;
      var _this$props = this.props,
          newChannel = _this$props.channel,
          newEvent = _this$props.event;

      if (oldChannel === newChannel && oldEvent === newEvent) {
        return;
      }

      this.bindPusherEvent(newChannel, newEvent);
      this.unbindPusherEvent(oldChannel, oldEvent);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.unbindPusherEvent(this.props.channel, this.props.event);
    }
  }, {
    key: "unbindPusherEvent",
    value: function unbindPusherEvent(channel, event) {
      var pusherChannel = Pusher.pusherClient.channels.find(channel);

      if (pusherChannel) {
        pusherChannel.unbind(event, this.props.onUpdate);
      }

      Pusher.channels[channel]--;

      if (Pusher.channels[channel] <= 0) {
        delete Pusher.channels[channel];
        Pusher.pusherClient.unsubscribe(channel);
      }
    }
  }, {
    key: "bindPusherEvent",
    value: function bindPusherEvent(channel, event) {
      var pusherChannel = Pusher.pusherClient.channels.find(channel) || Pusher.pusherClient.subscribe(channel);
      pusherChannel.bind(event, this.props.onUpdate);
      if (Pusher.channels[channel] === undefined) Pusher.channels[channel] = 0;
      Pusher.channels[channel]++;
    }
  }, {
    key: "render",
    value: function render() {
      return null;
    }
  }]);

  return Pusher;
}(_react.Component);

exports["default"] = Pusher;

_defineProperty(Pusher, "propTypes", {
  channel: _propTypes["default"].string.isRequired,
  onUpdate: _propTypes["default"].func.isRequired,
  event: _propTypes["default"].string.isRequired
});

_defineProperty(Pusher, "pusherClient", null);

_defineProperty(Pusher, "channels", {});

var setPusherClient = function setPusherClient(pusherClient) {
  Pusher.pusherClient = pusherClient;
};

exports.setPusherClient = setPusherClient;