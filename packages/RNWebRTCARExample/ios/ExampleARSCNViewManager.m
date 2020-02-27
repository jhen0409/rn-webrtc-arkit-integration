#import "ExampleARSCNViewManager.h"
#import <React/RCTUIManager.h>
#import <RNWebRTCARSession/RNWebRTCARSession.h>

@interface ExampleARSCNViewManager () <ARSCNViewDelegate, ARSessionDelegate>

@end

@implementation ExampleARSCNViewManager

static ARSCNView *_arView = nil;

RCT_EXPORT_MODULE()

- (UIView *)view
{
  return [self instance];
}

- (ARSCNView*)instance {
  if (_arView != nil) {
    return _arView;
  }
  ARSCNView *arView = [[ARSCNView alloc] init];
  arView.delegate = self;
  arView.session.delegate = self;
  arView.showsStatistics = true;
  _arView = arView;
  [self resume];
  return _arView;
}

- (void)pause {
  [_arView.session pause];
}

- (void)resume {
  ARFaceTrackingConfiguration *configuration = [ARFaceTrackingConfiguration new];
  [_arView.session runWithConfiguration:configuration];
}

#pragma mark - ARSCNViewDelegate
- (nullable SCNNode *)renderer:(id <SCNSceneRenderer>)renderer nodeForAnchor:(ARAnchor *)anchor {
  ARSCNFaceGeometry *faceMesh = [ARSCNFaceGeometry faceGeometryWithDevice:_arView.device];
  SCNNode *node = [SCNNode nodeWithGeometry:faceMesh];
  node.geometry.firstMaterial.fillMode = SCNFillModeLines;
  return node;
}

- (void)renderer:(id <SCNSceneRenderer>)renderer didUpdateNode:(SCNNode *)node forAnchor:(ARAnchor *)anchor {
  if ([anchor isKindOfClass:[ARFaceAnchor class]] && [node.geometry isKindOfClass:[ARSCNFaceGeometry class]]) {
    ARFaceAnchor *faceAnchor = anchor;
    ARSCNFaceGeometry *faceMesh = node.geometry;
    [faceMesh updateFromFaceGeometry:faceAnchor.geometry];
  }
}


RCT_EXPORT_METHOD(injectARSession:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [RNWebRTCARSession setArView:_arView];
  resolve(@{});
}

RCT_EXPORT_METHOD(revertARSession:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  [RNWebRTCARSession setArView:nil];
  resolve(@{});
}

@end
