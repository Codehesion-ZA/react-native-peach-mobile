require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "React-PeachMobile"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-peach-mobile
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-peach-mobile"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "9.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/github_account/react-native-peach-mobile.git", :tag => "#{s.version}" }
  s.vendored_frameworks = 'ios/OPPWAMobile.framework'

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true
  s.swift_version = '5.0'

  s.dependency "React"
	
  # s.dependency "..."
end

