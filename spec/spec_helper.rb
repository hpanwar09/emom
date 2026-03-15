# typed: false
# frozen_string_literal: true

require_relative '../lib/emom'
require 'rack/test'

ENV['RACK_ENV'] = 'test'

Emom::Server.set :permitted_hosts, []

RSpec.configure do |config|
  config.include Rack::Test::Methods

  config.before(:suite) do
    Emom::Database.cleanup!
  end

  config.after do
    Emom::Database.connection[:workouts].delete
  end
end
