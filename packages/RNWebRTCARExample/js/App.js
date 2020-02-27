import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, SafeAreaView } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import { isARWorldTrackingSupported } from 'react-native-webrtc-ar-session'
import { createWebRTCClient } from './utils/rtc'
import AR from './AR'
import Setting from './Setting'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  remoteContainer: { position: 'absolute', top: 0, right: 0 },
  remote: { width: 150, height: 200, backgroundColor: 'black' },
})

const ar = isARWorldTrackingSupported()

export default function App() {
  const [setting, setSetting] = useState({
    debug: __DEV__,
    arEnabled: ar,
    faceTracking: false,
  })
  const [localStreamURL, setLocalStreamURL] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  useEffect(() => {
    if (!setting.roomId) {
      return
    }
    const client = createWebRTCClient({
      ar: setting.arEnabled,
      onLocalStream: stream => {
        setLocalStreamURL(stream.toURL())
        client.join(setting.roomId)
      },
      onAddStream: (id, stream) =>
        setRemoteStreams(streams => ({
          ...streams,
          [id]: stream.toURL(),
        })),
      onRemoveStream: id =>
        setRemoteStreams(streams => {
          delete streams[id]
          return streams
        }),
      onLog: console.log,
      onError: console.log,
    })

    return () => {
      setLocalStreamURL(null)
      setRemoteStreams({})
      client.close()
    }
  }, [setting.roomId, setting.arEnabled, setting.faceTracking])

  const handleSettingChange = useCallback(
    (name, value) =>
      setSetting(state => ({
        ...state,
        [name]: value,
      })),
    [setSetting],
  )

  return (
    <>
      {setting.arEnabled ? (
        <AR debug={setting.debug} faceTracking={setting.faceTracking} />
      ) : (
        <RTCView streamURL={localStreamURL} style={styles.container} />
      )}
      <SafeAreaView style={styles.remoteContainer}>
        {Object.entries(remoteStreams).map(([id, streamURL], index) => (
          <RTCView key={id} streamURL={streamURL} style={styles.remote} />
        ))}
      </SafeAreaView>
      <Setting onChange={handleSettingChange} />
    </>
  )
}
