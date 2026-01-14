# JacTTS - TTS for twitch

## PIPER cli usage example

```sh
 echo "raz dwa trzy" | piper -m ./piper/voices/pl_PL-mc_speech-medium.onnx --output-file elo.wav
```

## Profanity prevention

Assumption is that messages containing profanities will be filtered out by twich automod.

openssl req -x509 -newkey rsa:4096 -nodes \
 -out ./cert.pem \
 -keyout ./key.pem -days 365
