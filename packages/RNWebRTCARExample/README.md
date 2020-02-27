# Example for react-native-webrtc-ar-session

- Example 1: AR scene example with `react-native-arkit`
- Example 2: AR face tracking example with [custom native view](ios/ExampleARSCNViewManager.m) (You can switch it on Setting)

## Installation

```bash
# OPTIONAL: Run this command if you got `WebRTC.framework does not contain bitcode` build error
$ yarn webrtc-dl-bitcode

$ cd ios && pod install && cd -
```

## Usage

- After opened the app, click `Setting` button to type `Room ID`.
- You can visit [https://rnwebrtc-server.herokuapp.com](https://rnwebrtc-server.herokuapp.com) for test.
