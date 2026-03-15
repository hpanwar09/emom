# typed: false
# frozen_string_literal: true

require 'sequel'
require 'fileutils'
require 'time'

module Emom
  class Database
    def self.connection
      @connection ||= begin
        db_path = File.join(Emom.data_dir, 'data.db')
        db = Sequel.sqlite(db_path)
        migrate!(db)
        db
      end
    end

    def self.migrate!(db)
      db.create_table?(:workouts) do
        primary_key :id
        String   :exercise, default: 'Workout'
        Integer  :reps_per_minute, null: false
        Integer  :duration
        Integer  :target
        Integer  :rounds, null: false, default: 0
        DateTime :started_at, null: false
        DateTime :completed_at, null: false

        index :completed_at
      end
    end

    def self.save_workout(data)
      connection[:workouts].insert(data)
    end

    def self.cleanup!
      connection[:workouts].delete
    end

    def self.find_workout(id)
      row = connection[:workouts].where(id: id).first
      row ? enrich(row) : nil
    end

    def self.recent_workouts(limit: 50)
      connection[:workouts]
        .reverse(:completed_at)
        .limit(limit)
        .all
        .map { |w| enrich(w) }
    end

    def self.stats(workouts = nil)
      workouts ||= recent_workouts
      {
        total_workouts: workouts.size,
        total_reps: workouts.sum { |w| w[:total_reps_done] },
        total_minutes: workouts.sum { |w| w[:rounds] },
        streak: calculate_streak(workouts)
      }
    end

    def self.enrich(w)
      completed = parse_time(w[:completed_at])
      started = parse_time(w[:started_at])
      elapsed = completed && started ? (completed - started).to_f : 0

      w.merge(
        total_reps_done: w[:reps_per_minute] * w[:rounds],
        planned_duration: w[:duration] || (w[:target] ? (w[:target].to_f / w[:reps_per_minute]).ceil : nil),
        planned_target: w[:target] || (w[:duration] ? w[:duration] * w[:reps_per_minute] : nil),
        elapsed_seconds: elapsed,
        mode: if w[:duration]
                'duration'
              else
                (w[:target] ? 'target' : 'open')
              end
      )
    end

    def self.parse_time(val)
      return val if val.is_a?(Time)
      return val.to_time if val.respond_to?(:to_time)

      Time.parse(val) if val.is_a?(String)
    end

    def self.calculate_streak(workouts)
      dates = workouts
              .map { |w| w[:completed_at] }
              .compact
              .map { |t| t.is_a?(String) ? Date.parse(t) : t.to_date }
              .uniq
              .sort
              .reverse

      return 0 if dates.empty?

      streak = 0
      expected = Date.today

      dates.each do |date|
        break if date < expected - 1

        streak += 1 if date == expected || date == expected - 1
        expected = date - 1
      end

      streak
    end
  end
end
