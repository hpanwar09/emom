# typed: false
# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Emom::Helpers do
  let(:helper) { Class.new { include Emom::Helpers }.new }

  describe '#mode_tab' do
    it 'renders a button with mode-tab class' do
      html = helper.mode_tab('duration')
      expect(html).to include('mode-tab')
      expect(html).to include('duration')
    end

    it 'adds active class when active' do
      html = helper.mode_tab('duration', active: true)
      expect(html).to include('mode-tab active')
    end
  end

  describe '#icon_sound_on' do
    it 'returns an SVG string' do
      expect(helper.icon_sound_on).to include('<svg')
      expect(helper.icon_sound_on).to include('polygon')
    end
  end

  describe '#icon_sound_off' do
    it 'returns an SVG with cross lines' do
      expect(helper.icon_sound_off).to include('<svg')
      expect(helper.icon_sound_off).to include('<line')
    end
  end

  describe '#format_time' do
    it 'formats a Time object' do
      time = Time.new(2026, 3, 16, 14, 30)
      result = helper.format_time(time)
      expect(result).to include('mar 16')
      expect(result).to include('2:30 pm')
    end

    it 'formats an ISO string' do
      result = helper.format_time('2026-03-16T14:30:00+05:30')
      expect(result).to include('mar 16')
    end

    it 'handles nil gracefully' do
      expect(helper.format_time(nil)).to eq('')
    end
  end

  describe '#mode_badge' do
    it 'returns target badge for target mode' do
      html = helper.mode_badge('target')
      expect(html).to include('target')
      expect(html).to include('text-accent-green')
    end

    it 'returns nil for duration mode' do
      expect(helper.mode_badge('duration')).to be_nil
    end
  end
end
