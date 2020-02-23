import { NativeModules } from 'react-native'

const { RNWebRTCARSession } = NativeModules

if (RNWebRTCARSession) {
  RNWebRTCARSession.init()
}

const noop = f => f

export const startCapturingARView = noop
export const stopCapturingARView = noop
export const isARWorldTrackingSupported = () => false
