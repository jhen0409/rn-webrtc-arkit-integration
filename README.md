[![CI Status](https://github.com/jhen0409/rn-webrtc-arkit-integration/workflows/Test/badge.svg)](https://github.com/jhen0409/rn-webrtc-arkit-integration)
[![CI Status](https://github.com/jhen0409/rn-webrtc-arkit-integration/workflows/Build%20apps/badge.svg)](https://github.com/jhen0409/rn-webrtc-arkit-integration)

Capturing ARKit scene (Like [`react-native-arkit`](https://github.com/react-native-ar/react-native-arkit)) into [`react-native-webrtc`](https://github.com/react-native-webrtc/react-native-webrtc) video stream.

- [Package (react-native-webrtc-ar-session)](packages/react-native-webrtc-ar-session)
- [Example](apps/RNWebRTCARExample)

## Introdution

**IMAGE**

For made integration between ARKit and WebRTC, this plugin continuously capture `[ARSCNView snapshot]` and convert to `RTCVideoFrame`.

You can use it with `react-native-arkit` or any `ARSCNView` implementation.

## Credits

- [Example](https://github.com/HippoAR/ReactNativeARKit) from [react-native-arkit](https://github.com/react-native-ar/react-native-arkit)
- [react-native-webrtc-server](https://github.com/oney/react-native-webrtc-server)

## License

[MIT](LICENSE.md)
