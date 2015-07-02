require 'rubygems'
require 'bundler/setup'
require 'rack'
require 'rack/router'
require 'erb'

dev_boot = -> {
  puts "booting in development mode"
  require 'byebug'
  require 'dotenv'
  Dotenv.load
}

prod_boot = -> {
  puts "booting in production mode"
}

ENV["RACK_ENV"] == "development" ? dev_boot.() : prod_boot.()

$stdout.sync = true

use Rack::Static,
  :urls => ["/css", "/js", "/images", "/data"],
  :root => "public"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('public/index.html', File::RDONLY)
  ]
}

