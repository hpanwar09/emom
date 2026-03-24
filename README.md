# <img src="public/favicon.svg" width="32" height="32" alt="emom" /> emom

each minute on the minute.

a minimalist emom workout timer. runs from your terminal, opens in your browser.

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

1. pick your exercise and set reps per minute + number of rounds
2. hit start — 3-2-1 countdown with audio beeps
3. timer runs — big countdown, round counter, rep tally
4. stop or let it finish — summary card you can download as an image

## dev

live-reload is built in — save any file in `views/`, `public/`, or `lib/` and the browser refreshes automatically.

```bash
emom          # start server + open browser
```

## tech

- ruby + sinatra (backend)
- slim templates + stimulus.js (frontend)
- inter (typography)
- web audio api (beeps, no audio files)
- web worker (accurate timer, immune to tab throttling)
- sqlite (local data)
- tailwind cdn (styling)
- html2canvas (share card generation)

## requirements

- ruby 3.1+
- bundler

## tests

```bash
bundle exec rspec spec/
bundle exec rubocop lib/ spec/
```
