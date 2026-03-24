# typed: false
# frozen_string_literal: true

module Emom
  module Helpers
    def stepper(field:, label:, value:, min: 1, max: 999, target: field)
      slim :_stepper, locals: {
        field: field, label: label, value: value,
        min: min, max: max, target: target
      }
    end

    def icon_sound_on
      <<~SVG
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      SVG
    end

    def icon_sound_off
      <<~SVG
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      SVG
    end

    def format_time(time)
      t = time.is_a?(String) ? Time.parse(time) : time
      t.strftime('%b %d · %l:%M %p').downcase.strip
    rescue StandardError
      time.to_s
    end
  end
end
