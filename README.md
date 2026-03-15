# <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2300ff88'/%3E%3Ctext x='50' y='72' font-size='70' font-weight='900' font-family='system-ui,sans-serif' fill='%230a0a12' text-anchor='middle'%3Ee%3C/text%3E%3C/svg%3E" width="32" height="32" alt="emom favicon" /> emom

each minute on the minute.

a minimalist emom workout timer. runs from your terminal, opens in your browser.

dark theme. flip-clock font. audio countdown. downloadable workout summary card.

## setup

```bash
git clone https://github.com/hpanwar09/emom.git
cd emom
bin/setup
```

this installs dependencies and adds the `emom` command to your system.

## usage

```bash
emom          # start the timer (opens browser)
emom test     # run specs
emom lint     # run rubocop
```

## how it works

1. configure your workout — set duration or target reps, reps per minute, exercise name
2. hit start — 3-2-1 countdown with audio beeps
3. timer runs — shows time left, current round, reps completed
4. workout complete — summary card you can download as an image

## two modes

- **duration** — set minutes + reps per minute (e.g. 10 min × 5 reps = 50 total)
- **target** — set total reps + reps per minute (e.g. 500 reps ÷ 10/min = 50 min)

## tech

- ruby + sinatra (backend)
- slim templates + stimulus.js (frontend)
- web audio api (beeps, no audio files)
- web worker (accurate timer, immune to tab throttling)
- sqlite (local data)
- tailwind cdn (styling)
- html2canvas (share card generation)

## requirements

- ruby 3.1+
- bundler

## development

```bash
bundle install
bundle exec ruby bin/start
```

runs at `http://localhost:4567`

## tests

```bash
bundle exec rspec spec/
bundle exec rubocop lib/ spec/
```
