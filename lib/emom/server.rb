# typed: false
# frozen_string_literal: true

require 'sinatra/base'
require 'slim'

module Emom
  class Server < Sinatra::Base
    set :views, File.expand_path('../../views', __dir__)
    set :public_folder, File.expand_path('../../public', __dir__)
    set :show_exceptions, false
    set :logging, false
    helpers Emom::Helpers

    get '/' do
      slim :index, layout: :layout
    end
  end
end
