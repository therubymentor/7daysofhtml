# encoding: utf-8
class StaticHtmlRouter
  def call(env)
    @env = env
    [200, headers, [html]]
  end

private

  attr_reader :env

  def headers
    { 'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400' }
  end

  def html
    action = segment.length > 1 ? segment : "/index.html"
    File.read(["./public", action].join)
  end

  def segment
    Rack::Request.new(env).path
  end

end
