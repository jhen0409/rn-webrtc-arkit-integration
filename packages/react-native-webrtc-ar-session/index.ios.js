import { NativeModules } from 'react-native'
import invariant from 'invariant'

const { RNWebRTCARSession } = NativeModules

if (RNWebRTCARSession) {
  RNWebRTCARSession.init()
}

const checkNativeModule = () =>
  invariant(
    RNWebRTCARSession,
    'Native Module `react-native-webrtc-ar-session` is not linked.',
  )

export const startCapturingARView = (options = {}) => {
  checkNativeModule()
  return RNWebRTCARSession.startSession(options)
}

export const stopCapturingARView = () => {
  checkNativeModule()
  return RNWebRTCARSession.stopSession()
}

export const isARWorldTrackingSupported = () => {
  checkNativeModule()
  return !!RNWebRTCARSession.AR_WORLD_TRACKING_SUPPORTED
}

export const isARFaceTrackingSupported = () => {
  checkNativeModule()
  return !!RNWebRTCARSession.AR_FACE_TRACKING_SUPPORTED
}
