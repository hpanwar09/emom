# typed: false
# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Emom::Server do
  def app
    described_class
  end

  describe 'GET /' do
    it 'returns 200' do
      get '/', {}, { 'HTTP_HOST' => 'localhost' }
      expect(last_response.status).to eq(200)
    end

    it 'renders the config screen' do
      get '/', {}, { 'HTTP_HOST' => 'localhost' }
      expect(last_response.body).to include('emom')
      expect(last_response.body).to include('reps every minute')
      expect(last_response.body).to include('start')
    end
  end
end
