cp ../cherokee-audio-data/see-say-write/ssw-audio/* ./public/ssw-audio # copy cherokee audio
cp ../cherokee-audio-data/see-say-write/ssw.json ./src/data/collections/ # copy lessons
# generate english audio and store a copy of the cards with english audio linked
$(
    cd ../audio-lessons-generator-python
    ./online_exercises/generate-ssw-audio.zsh
)