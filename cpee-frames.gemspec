Gem::Specification.new do |s|
  s.name             = "cpee-frames"
  s.version          = "1.0.2"
  s.platform         = Gem::Platform::RUBY
  s.license          = "GPL-3.0"
  s.summary          = "Dashboard management service with UI and backend for the cpee.org family of workflow management tools"

  s.description      = "Flexibly arrange and display user interface components in a grid from executable process models. Very useful if you want to build dashboards."

  s.files            = Dir['{server/*,ui/**/*,tools/**/*,lib/**/*}'] + %w(LICENSE Rakefile cpee-frames.gemspec README.md AUTHORS)
  s.require_path     = 'lib'
  s.extra_rdoc_files = ['README.md']
  s.bindir           = 'tools'
  s.executables      = ['cpee-frames']

  s.required_ruby_version = '>=3.0'

  s.authors          = ['Manuell Gall', "Juergen 'eTM' Mangler"]

  s.email            = 'gall.manuel.89@gmail.com'
  s.homepage         = 'https://github.com/ManuelGall/cpee-frames'

  s.add_runtime_dependency 'riddl', '~> 0.99'
  s.add_runtime_dependency 'json', '~> 2.1'
end
