from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Load Whisper model (using 'base' for balance of speed and accuracy)
# Options: tiny, base, small, medium, large
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded successfully!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "whisper-base"}), 200

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio file to text using Whisper
    Expects: audio file in request.files['audio']
    Returns: {"text": "transcribed text"}
    """
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "Empty filename"}), 400
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name
        
        try:
            # Transcribe using Whisper
            print(f"Transcribing audio file: {temp_path}")
            result = model.transcribe(temp_path, language='en')
            transcribed_text = result["text"].strip()
            
            print(f"Transcription: {transcribed_text}")
            
            return jsonify({
                "text": transcribed_text,
                "language": result.get("language", "en")
            }), 200
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        "service": "Climate Buddy Speech Recognition API",
        "model": "OpenAI Whisper (base)",
        "endpoints": {
            "/health": "Health check",
            "/transcribe": "POST audio file for transcription"
        }
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
