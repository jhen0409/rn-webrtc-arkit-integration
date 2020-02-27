import React, { useEffect } from 'react'
import { requireNativeComponent, NativeModules } from 'react-native'

const ExampleARSCNView = requireNativeComponent('ExampleARSCNView')

const {
  injectARSession,
  revertARSession,
} = NativeModules.ExampleARSCNViewManager

export default function(props) {
  useEffect(() => {
    injectARSession()
    return () => revertARSession()
  }, [])
  return <ExampleARSCNView {...props} />
}
