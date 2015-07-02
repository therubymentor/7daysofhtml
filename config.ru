require 'rubygems'
require 'bundler/setup'
require 'rack'
require 'rack/router'
require 'erb'

require_relative 'static_html_router'

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

html_files  = Dir["public/*.html"].map{ |p| File.basename(p) }
other_files = ["/favicon.ico", "/images", "/js", "/css", "/defaults"]

use Rack::Static,
  :urls => html_files + other_files,
  :root => "public"

run StaticHtmlRouter.new
