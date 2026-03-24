# typed: false
# frozen_string_literal: true

require 'sinatra/base'
require 'slim'
require 'json'

module Emom
  class Server < Sinatra::Base
    set :views, File.expand_path('../../views', __dir__)
    set :public_folder, File.expand_path('../../public', __dir__)
    set :show_exceptions, false
    set :logging, false
    helpers Emom::Helpers

    before do
      cache_control :no_cache, :no_store, :must_revalidate
      headers 'Pragma' => 'no-cache', 'Expires' => '0'
    end

    WATCH_DIRS = [
      File.expand_path('../../views', __dir__),
      File.expand_path('../../public', __dir__),
      File.expand_path('../../lib', __dir__)
    ].freeze

    get '/' do
      slim :index, layout: :layout
    end

    get '/dev/changes' do
      content_type :json
      mtime = WATCH_DIRS.flat_map { |d| Dir.glob(File.join(d, '**', '*')) }
                        .select { |f| File.file?(f) }
                        .map { |f| File.mtime(f).to_f }
                        .max || 0
      { mtime: mtime }.to_json
    end
  end
end
