# typed: false
# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Emom::Database do
  let(:now) { Time.now }
  let(:workout_data) do
    {
      exercise: 'Push-ups',
      reps_per_minute: 10,
      duration: 5,
      target: nil,
      rounds: 5,
      started_at: now - 300,
      completed_at: now
    }
  end

  describe '.save_workout' do
    it 'inserts a workout and returns the id' do
      id = described_class.save_workout(workout_data)
      expect(id).to be_a(Integer)
    end
  end

  describe '.find_workout' do
    it 'returns enriched workout by id' do
      id = described_class.save_workout(workout_data)
      workout = described_class.find_workout(id)

      expect(workout[:id]).to eq(id)
      expect(workout[:exercise]).to eq('Push-ups')
      expect(workout[:total_reps_done]).to eq(50)
      expect(workout[:mode]).to eq('duration')
    end

    it 'returns nil for non-existent id' do
      expect(described_class.find_workout(99_999)).to be_nil
    end
  end

  describe '.recent_workouts' do
    before do
      3.times { |i| described_class.save_workout(workout_data.merge(rounds: i + 1)) }
    end

    it 'returns workouts in reverse chronological order' do
      workouts = described_class.recent_workouts
      expect(workouts.size).to eq(3)
    end

    it 'respects limit parameter' do
      workouts = described_class.recent_workouts(limit: 2)
      expect(workouts.size).to eq(2)
    end

    it 'enriches each workout with derived fields' do
      workout = described_class.recent_workouts.first
      expect(workout).to have_key(:total_reps_done)
      expect(workout).to have_key(:planned_duration)
      expect(workout).to have_key(:mode)
    end
  end

  describe '.cleanup!' do
    it 'deletes all workouts' do
      described_class.save_workout(workout_data)
      expect { described_class.cleanup! }
        .to change { described_class.connection[:workouts].count }.to(0)
    end
  end

  describe '.enrich' do
    context 'with duration mode workout' do
      it 'derives total_reps_done' do
        result = described_class.enrich(workout_data.merge(id: 1))
        expect(result[:total_reps_done]).to eq(50)
      end

      it 'derives planned_target from duration * reps' do
        result = described_class.enrich(workout_data.merge(id: 1))
        expect(result[:planned_target]).to eq(50)
      end

      it 'sets mode to duration' do
        result = described_class.enrich(workout_data.merge(id: 1))
        expect(result[:mode]).to eq('duration')
      end
    end

    context 'with target mode workout' do
      let(:target_data) { workout_data.merge(id: 1, duration: nil, target: 100) }

      it 'derives planned_duration from target / reps' do
        result = described_class.enrich(target_data)
        expect(result[:planned_duration]).to eq(10)
      end

      it 'sets mode to target' do
        result = described_class.enrich(target_data)
        expect(result[:mode]).to eq('target')
      end
    end
  end

  describe '.stats' do
    before do
      described_class.save_workout(workout_data.merge(rounds: 5))
      described_class.save_workout(workout_data.merge(rounds: 10))
    end

    it 'calculates totals from workouts' do
      workouts = described_class.recent_workouts
      stats = described_class.stats(workouts)

      expect(stats[:total_workouts]).to eq(2)
      expect(stats[:total_reps]).to eq(150)
      expect(stats[:total_minutes]).to eq(15)
    end
  end
end
