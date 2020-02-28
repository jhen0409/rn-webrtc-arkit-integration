require 'json'
pkg = JSON.parse(File.read('../package.json'))

Pod::Spec.new do |s|
  s.name         = "RNWebRTCARSession"
  s.version      = pkg["version"]
  s.summary      = pkg["description"]
  s.homepage     = pkg["homepage"]
  s.license      = pkg["license"]
  s.author       = pkg["author"]
  s.platform     = :ios, "10.0"
  s.source       = { :git => pkg["repository"], :tag => "master" }
  s.source_files = "**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "react-native-webrtc"

end

  