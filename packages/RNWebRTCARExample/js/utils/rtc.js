import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import {
  isARWorldTrackingSupported,
  startCapturingARView,
  stopCapturingARView,
} from 'react-native-webrtc-ar-session'
import config from '../config'
import { createSignalClient } from './signal'

async function getLocalStream(isFront, callback) {
  const sourceInfos = await mediaDevices.enumerateDevices()
  let videoSourceId
  sourceInfos.some(info => {
    if (info.kind === 'video' && info.facing === (isFront ? 'front' : 'back')) {
      videoSourceId = info.id
    }
  })
  return mediaDevices.getUserMedia({
    audio: true,
    video: {
      // NOTE: Specified field by using patch:
      // https://github.com/jhen0409/rn-webrtc-arkit-integration/blob/master/patches/react-native-webrtc%2B1.75.3.patch#L45
      ar: isARWorldTrackingSupported(),
      mandatory: {
        // minWidth: 500,
        // minHeight: 300,
        minFrameRate: 30,
      },
      facingMode: isFront ? 'user' : 'environment',
      optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
    },
  })
}

export const createWebRTCClient = ({
  onLocalStream,
  onAddStream,
  onRemoveStream,
  onPeerLeave,
  onLog,
  onError,
}) => {
  const peers = {}

  let client
  let localStream

  const getStats = () => {
    const peer = peers[Object.keys(peers)[0]]
    if (
      peer.getRemoteStreams()[0] &&
      peer.getRemoteStreams()[0].getAudioTracks()[0]
    ) {
      const track = peer.getRemoteStreams()[0].getAudioTracks()[0]
      onLog('track', track)
      peer
        .getStats(track)
        .then(report => onLog('getStats report', report))
        .catch(onError)
    }
  }

  const createPeerConnection = (id, isOffer) => {
    const peer = new RTCPeerConnection(config.pc)
    peers[id] = peer

    peer.onicecandidate = event => {
      onLog('onicecandidate', event.candidate)
      if (event.candidate) {
        client.exchange(id, { candidate: event.candidate })
      }
    }

    const createOffer = async () => {
      const description = await peer.createOffer()
      onLog('createOffer', description)
      await peer.setLocalDescription(description)
      onLog('setLocalDescription', peer.localDescription)
      client.exchange(id, { sdp: peer.localDescription })
    }

    peer.onnegotiationneeded = () => {
      onLog('onnegotiationneeded')
      if (isOffer) {
        createOffer().catch(onError)
      }
    }
    peer.onicepeerstatechange = event => {
      const { iceConnectionState } = event.target
      onLog('onicepeerstatechange', iceConnectionState)
      if (iceConnectionState === 'completed') {
        setTimeout(getStats, 1e3)
      }
    }
    peer.onsignalingstatechange = event => {
      onLog('onsignalingstatechange', event.target.signalingState)
    }
    peer.onaddstream = event => {
      onLog('onaddstream', id, event.stream)
      onAddStream(id, event.stream)
    }
    peer.onremovestream = event => {
      onLog('onremovestream', id, event.stream)
      onRemoveStream(id)
    }
    peer.addStream(localStream)
    return peer
  }

  const exchange = async data => {
    const { from: id } = data
    const peer = id in peers ? peers[id] : createPeerConnection(id, false)

    if (data.sdp) {
      onLog('exchange sdp', data)
      await peer.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (peer.remoteDescription.type === 'offer') {
        const desc = await peer.createAnswer()
        onLog('createAnswer', desc)
        await peer.setLocalDescription(desc)
        onLog('setLocalDescription', peer.localDescription)
        client.exchange(id, { sdp: peer.localDescription })
      }
    } else {
      onLog('exchange candidate', data)
      peer.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }

  const leave = id => {
    const peer = peers[id]
    if (!peer) {
      return
    }
    peer.close()
    delete peers[id]
    onLog('leave', id)
    onRemoveStream(id)
  }

  client = createSignalClient({
    onEvent: (type, payload) => {
      switch (type) {
        case 'join':
          onLog('join', payload)
          payload.list.forEach(id => createPeerConnection(id, true))
          break
        case 'connect':
          onLog('connect')
          getLocalStream(false).then(stream => {
            localStream = stream
            onLocalStream(stream)
            startCapturingARView().then(result =>
              onLog('Start WebRTC AR session', result),
            )
          })
          break
        case 'exchange':
          exchange(payload).catch(onError)
          break
        case 'leave':
          leave(payload)
          break
        case 'close':
          Object.entries(peers).forEach(([id, peer]) => {
            delete peers[id]
            peer.close()
          })
          if (localStream) {
            localStream.release()
          }
          stopCapturingARView()
          break
      }
    },
  })

  return {
    ...client,
    getPeers: () => peers,
  }
}
