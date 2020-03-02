#import <React/RCTBridgeModule.h>
#import "RNWebRTCARSession.h"
#import <ARKit/ARKit.h>
#import <WebRTC/RTCCVPixelBuffer.h>
#import <WebRTC/RTCVideoCapturer.h>
#import <WebRTC/RTCVideoSource.h>
#import <WebRTC/RTCVideoFrameBuffer.h>
#import <react-native-webrtc/WebRTCModule.h>

@interface RNWebRTCARSession () <RCTBridgeModule>

@property (nonatomic,strong) dispatch_source_t timer;


@end

@implementation RNWebRTCARSession

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (NSDictionary *)constantsToExport
{
  if (@available(iOS 11.0, *)) {
    return @{
      @"AR_WORLD_TRACKING_SUPPORTED": @(ARWorldTrackingConfiguration.isSupported),
      @"AR_FACE_TRACKING_SUPPORTED": @(ARFaceTrackingConfiguration.isSupported)
    };
  } else {
    return @{
      @"AR_WORLD_TRACKING_SUPPORTED": @(NO),
      @"AR_FACE_TRACKING_SUPPORTED": @(NO),
    };
  }
}

static RTCVideoCapturer *_dummyCapturer;
static RTCVideoSource *_videoSource;
API_AVAILABLE(ios(11.0))
static ARSCNView *_arView;

#pragma mark - RNWebRTCARSession

- (CVPixelBufferRef)getPixelBufferFromCGImage:(UIImage *)uiimage {
  CGImageRef imageRef = uiimage.CGImage;
  
  CGDataProviderRef provider = CGImageGetDataProvider(imageRef);
  CFDataRef pixelData = CGDataProviderCopyData(provider);
  const unsigned char *data = CFDataGetBytePtr(pixelData);

  size_t frameWidth = CGImageGetWidth(imageRef);
  size_t frameHeight = CGImageGetHeight(imageRef);
  
  CFRelease(pixelData);

  NSDictionary *options = @{(id)kCVPixelBufferIOSurfacePropertiesKey : @{}};
  CVPixelBufferRef pixelBuffer = NULL;
  CVReturn status = CVPixelBufferCreate(kCFAllocatorDefault, frameWidth, frameHeight, kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange, (__bridge CFDictionaryRef)(options), &pixelBuffer);
  NSParameterAssert(status == kCVReturnSuccess && pixelBuffer != NULL);
      
  CVPixelBufferLockBaseAddress(pixelBuffer, 0);
      
  size_t width = CVPixelBufferGetWidth(pixelBuffer);
  size_t height = CVPixelBufferGetHeight(pixelBuffer);
      
  size_t wh = width * height;

  size_t width0 = CVPixelBufferGetWidthOfPlane(pixelBuffer, 0);
  size_t height0 = CVPixelBufferGetHeightOfPlane(pixelBuffer, 0);
  size_t bpr0 = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 0);

  size_t height1 = CVPixelBufferGetHeightOfPlane(pixelBuffer, 1);
  size_t bpr1 = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 1);

  unsigned char *bufY = malloc(wh);
  unsigned char *bufUV = malloc(wh / 2);
   
  size_t offset, p;

  int r,g,b,y,u,v;
  int a = 255;
  for (int row = 0; row < height; ++row) {
    for (int col = 0; col < width; ++col) {
      offset = ((width * row) + col);
      p = offset * 4;
      r = data[p + 2];
      g = data[p + 1];
      b = data[p + 0];
      a = data[p + 3];

      // RGB to YUV
      y = 0.299*r + 0.587*g + 0.114*b;
      u = -0.1687*r - 0.3313*g + 0.5*b + 128;
      v = 0.5*r - 0.4187*g - 0.0813*b + 128;

      bufY[offset] = y;
      bufUV[(row / 2) * width + (col / 2) * 2] = u;
      bufUV[(row / 2) * width + (col / 2) * 2 + 1] = v;
    }
  }
  uint8_t *yPlane = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 0);
  memset(yPlane, 0x80, height0 * bpr0);
  for (int row = 0; row < height0; ++row) {
    memcpy(yPlane + row * bpr0, bufY + row * width0, width0);
  }
  uint8_t *uvPlane = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 1);
  memset(uvPlane, 0x80, height1 * bpr1);
  for (int row=0; row < height1; ++row) {
    memcpy(uvPlane + row * bpr1, bufUV + row * width, width);
  }
      
  CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
  free(bufY);
  free(bufUV);
  
  return pixelBuffer;
}

+ (void)setArView:(ARSCNView *)arView API_AVAILABLE(ios(11.0)){
  _arView = arView;
}

- (void)captureARSnapshot API_AVAILABLE(ios(11.0)){
  int64_t timeStampNs = [[NSDate date] timeIntervalSince1970] * 1000000000;
  CVPixelBufferRef pixelBuffer = [self getPixelBufferFromCGImage:[_arView snapshot]];
  [_videoSource
    capturer:_dummyCapturer
    didCaptureVideoFrame:
      [[RTCVideoFrame alloc]
        initWithBuffer:[[RTCCVPixelBuffer alloc] initWithPixelBuffer:pixelBuffer]
        rotation:RTCVideoRotation_0
        timeStampNs:timeStampNs
      ]
  ];
  CVPixelBufferRelease(pixelBuffer);
}

RCT_EXPORT_METHOD(init:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  _dummyCapturer = NULL;
  _videoSource = NULL;
  if (self.timer) {
    dispatch_source_cancel(self.timer);
    self.timer = nil;
  }
  resolve(@{});
}

RCT_EXPORT_METHOD(stopSession:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
  _dummyCapturer = NULL;
  _videoSource = NULL;
  if (self.timer) {
    dispatch_source_cancel(self.timer);
    self.timer = nil;
  }
  resolve(@{});
}

RCT_EXPORT_METHOD(startSession:(NSDictionary *)options
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
) {
  NSInteger frameRate = [options[@"frameRate"] intValue];
  
  if (@available(iOS 11.0, *)) {
    _videoSource = [WebRTCModule arVideoSource];
      
    #if __has_include("RCTARKit.h")
    if (!_arView && [ARKit isInitialized]) {
      _arView = [ARKit sharedInstance].arView;
    }
    #endif
    if (_videoSource && _arView) {
      _dummyCapturer = [[RTCVideoCapturer alloc] init];

      dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
      self.timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);

      if (!frameRate) {
        frameRate = _arView.preferredFramesPerSecond;
      }
      dispatch_source_set_timer(
        self.timer,
        DISPATCH_TIME_NOW,
        NSEC_PER_SEC / frameRate,
        NSEC_PER_SEC
      );

      dispatch_source_set_event_handler(self.timer, ^{
        [self captureARSnapshot];
      });
      dispatch_resume(self.timer);

      resolve(@{ @"success": @(YES) });
      return;
    }
  }
  resolve(@{ @"success": @(NO) });
}

@end
