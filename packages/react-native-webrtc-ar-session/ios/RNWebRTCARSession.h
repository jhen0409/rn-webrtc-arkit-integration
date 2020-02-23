#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#if __has_include("RCTARKit.h")
#import "RCTARKit.h"
#endif

#import <ARKit/ARKit.h>

@interface RNWebRTCARSession : NSObject <RCTBridgeModule>

+ (void)setArView:(ARSCNView *)arView API_AVAILABLE(ios(11.0));

@end
