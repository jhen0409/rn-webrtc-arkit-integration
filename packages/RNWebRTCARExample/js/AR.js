import React from 'react'
import { StyleSheet } from 'react-native'
import { ARKit } from 'react-native-arkit'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
})

export default function AR(props) {
  return (
    <ARKit
      style={styles.container}
      planeDetection={ARKit.ARPlaneDetection.Horizontal}
      lightEstimationEnabled
      detectionImages={[{ resourceGroupName: 'DetectionImages' }]}
      {...props}
    >
      <ARKit.Text
        text="ARKit is Cool!"
        position={{ x: 0, y: 0.2, z: -1 }}
        font={{ size: 0.15, depth: 0.05 }}
      />
      <ARKit.Model
        position={{ x: -0, y: 0, z: -1, frame: 'local' }}
        scale={0.05}
        model={{
          scale: 1,
          file: 'art.scnassets/ship.scn',
        }}
      />
      <ARKit.Light
        position={{ x: 1, y: 3, z: 1 }}
        type={ARKit.LightType.Omni}
        color="white"
      />
      <ARKit.Light
        position={{ x: 0, y: 2, z: -1 }}
        type={ARKit.LightType.Spot}
        eulerAngles={{ x: -Math.PI / 2 }}
        spotInnerAngle={45}
        spotOuterAngle={45}
        color="#0cc"
      />
    </ARKit>
  )
}
