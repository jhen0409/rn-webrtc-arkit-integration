# react-native-webrtc-ar-session

Capturing ARKit scene (Like [`react-native-arkit`](https://github.com/react-native-ar/react-native-arkit)) into [`react-native-webrtc`](https://github.com/react-native-webrtc/react-native-webrtc) video stream.

- [Example](https://github.com/jhen0409/rn-webrtc-arkit-integration/tree/master/packages/RNWebRTCARExample)

# Installation

- Required use the [react-native-webrtc patch](https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/patches/react-native-webrtc%2B1.75.3.patch). (You can use [`patch-package`](https://github.com/ds300/patch-package))
- Add dependency with `yarn add react-native-webrtc-ar-session`
- You may need to run `react-native link react-native-webrtc-ar-session` or autolinking.

## Usage

After using [this react-native-webrtc patch](https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/patches/react-native-webrtc%2B1.75.3.patch), we need to set `ar: true` in `video` property of `mediaDevices.getUserMedia(...)`. (See [the example](https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/packages/RNWebRTCARExample/js/utils/rtc.js#L26-L28))

```js
import {
  isARWorldTrackingSupported,
  startCapturingARView,
  stopCapturingARView,
} from 'react-native-webrtc-ar-session'

// Check the device is support AR World Tracking
isARWorldTrackingSupported()

// Start capturing <ARKit /> view into WebRTC video stream
// You can call it after WebRTC and ARKit view is ready
startCapturingARView().then(({ success }) =>
  console.log('Start session:', success),
)

stopCapturingARView()
```

## Use another ARSCNView instead of `react-native-arkit`

You can have native ARSCNView setup without `react-native-arkit`:

```objective-c
// Add to your header file
#import "RNWebRTCARSession.h"

[RNWebRTCARSession setArView:__your_arscnview_here__];
```

## License

[MIT](https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/LICENSE.md)
