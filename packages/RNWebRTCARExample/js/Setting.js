import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { Modalize } from 'react-native-modalize'
import { isARWorldTrackingSupported } from 'react-native-webrtc-ar-session'
import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash.debounce'

const styles = StyleSheet.create({
  bottomWrap: {
    position: 'absolute',
    bottom: 4,
    left: 72,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 24,
    backgroundColor: '#aaaa',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 12, color: 'black', alignSelf: 'center' },

  modal: { padding: 16, backgroundColor: '#333a' },
  title: {
    color: '#ccc',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    color: '#ccc',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  fieldInput: {
    color: '#ccc',
    fontSize: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    padding: 4,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    padding: 8,
  },
  text: { fontSize: 12, color: '#999' },
  link: { color: '#2980b9', fontSize: 12 },

  roomId: { marginVertical: 8 },
  switch: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

const readme =
  'https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/packages/RNWebRTCARExample/README.md#usage'

export default function Settings(props) {
  const modal = useRef(null)
  const { onChange } = props
  const [roomId, setRoomId] = useState('')
  const [debug, setDebug] = useState(__DEV__)
  const [arEnabled, setAREnabled] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('roomId').then(setRoomId)
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('roomId', roomId || '').then(() => {
      onChange('roomId', roomId)
    })
  }, [onChange, roomId])

  useEffect(() => {
    onChange('debug', debug)
  }, [onChange, debug])

  useEffect(() => {
    onChange('arEnabled', arEnabled)
  }, [onChange, arEnabled])

  const handleRoomIdChange = useMemo(
    () =>
      debounce(id => {
        if (roomId !== id) {
          setRoomId(id)
        }
      }, 2e3),
    [roomId, setRoomId],
  )

  return (
    <>
      <SafeAreaView style={styles.bottomWrap}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (modal.current) {
              modal.current.open()
            }
          }}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <Modalize ref={modal} modalStyle={styles.modal}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.roomId}>
          <Text style={styles.field}>Room ID (WebRTC)</Text>
          <TextInput
            style={styles.fieldInput}
            onChangeText={handleRoomIdChange}
            defaultValue={roomId}
          />
        </View>
        {isARWorldTrackingSupported() && (
          <TouchableOpacity
            style={styles.switch}
            onPress={() => setAREnabled(val => !val)}
          >
            <Text style={styles.field}>Enable AR scene</Text>
            <Switch value={arEnabled} onValueChange={setAREnabled} />
          </TouchableOpacity>
        )}
        {isARWorldTrackingSupported() && (
          <TouchableOpacity
            style={styles.switch}
            onPress={() => setDebug(val => !val)}
          >
            <Text style={styles.field}>Debug AR scene</Text>
            <Switch value={debug} onValueChange={setDebug} />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.text}>Visit</Text>
          <TouchableOpacity onPress={() => Linking.openURL(readme)}>
            <Text style={styles.link}> this website </Text>
          </TouchableOpacity>
          <Text style={styles.text}>for more information.</Text>
        </View>
      </Modalize>
    </>
  )
}

Settings.propTypes = {
  onChange: PropTypes.func,
}
