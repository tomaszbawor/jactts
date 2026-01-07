{
  description = "Twitch TTS Bot with Piper";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Voice model configuration
        voiceName = "pl_PL-mc_speech-medium";
        voiceUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/pl/pl_PL/mc_speech/medium";
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Runtime
            bun
            typescript

            # TTS
            piper-tts

            # Audio playback (multiple options for compatibility)
            alsa-utils # aplay
            pulseaudio # paplay
            ffmpeg # ffplay
            sox # play
          ];

          shellHook = ''
            export PIPER_BINARY_PATH="${pkgs.piper-tts}/bin/piper"

            # Create piper directory for voice models
            mkdir -p ./piper/voices

            # Download voice model if not present
            if [ ! -f "./piper/voices/${voiceName}.onnx" ]; then
              echo "Downloading Piper voice model: ${voiceName}..."
              ${pkgs.curl}/bin/curl -L -o "./piper/voices/${voiceName}.onnx" \
                "${voiceUrl}/${voiceName}.onnx"
              ${pkgs.curl}/bin/curl -L -o "./piper/voices/${voiceName}.onnx.json" \
                "${voiceUrl}/${voiceName}.onnx.json"
              echo "Voice model downloaded!"
            fi

            # Update environment to point to the voice
            export PIPER_VOICE="${voiceName}"
            export PIPER_MODEL_PATH="./piper/voices/${voiceName}.onnx"

            echo ""
            echo "🎙️  Twitch TTS Bot Development Shell"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Piper TTS: ${pkgs.piper-tts.version}"
            echo "Bun: $(bun --version)"
            echo ""
            echo "Commands:"
            echo "  bun install    - Install dependencies"
            echo "  bun start      - Run the TTS bot"
            echo "  bun dev        - Run with watch mode"
            echo "  bun run check  - Run linter"
            echo ""
            echo "Environment:"
            echo "  PIPER_BINARY_PATH=$PIPER_BINARY_PATH"
            echo "  PIPER_VOICE=$PIPER_VOICE"
            echo ""
          '';
        };
      }
    );
}
