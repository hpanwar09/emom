# typed: false
# frozen_string_literal: true

require 'fileutils'
require_relative 'emom/database'
require_relative 'emom/helpers'
require_relative 'emom/server'

module Emom
  VERSION = '0.1.0'

  DATA_DIR = File.join(Dir.home, '.emom')

  def self.data_dir
    FileUtils.mkdir_p(DATA_DIR)
    DATA_DIR
  end
end
