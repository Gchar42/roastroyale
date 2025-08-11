import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.game import game_bp
from src.game_manager import GameManager

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app, origins="*")

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Initialize game manager
game_manager = GameManager()

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(game_bp, url_prefix='/api/game')

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

# SocketIO Events
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'status': 'Connected to Roast Royale server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Handle player leaving game
    game_manager.handle_player_disconnect(request.sid)

@socketio.on('join_room')
def handle_join_room(data):
    room_code = data['room_code']
    player_name = data['player_name']
    
    # Add player to game room
    success, message = game_manager.add_player_to_room(room_code, player_name, request.sid)
    
    if success:
        join_room(room_code)
        # Broadcast updated player list to all players in room
        room_data = game_manager.get_room_data(room_code)
        emit('room_updated', room_data, room=room_code)
        emit('join_success', {'message': message})
    else:
        emit('join_error', {'message': message})

@socketio.on('create_room')
def handle_create_room(data):
    player_name = data['player_name']
    
    # Create new game room
    room_code = game_manager.create_room(player_name, request.sid)
    join_room(room_code)
    
    room_data = game_manager.get_room_data(room_code)
    emit('room_created', {'room_code': room_code, 'room_data': room_data})

@socketio.on('start_game')
def handle_start_game(data):
    room_code = data['room_code']
    game_settings = data.get('settings', {})
    
    success, message = game_manager.start_game(room_code, request.sid, game_settings)
    
    if success:
        game_data = game_manager.get_game_data(room_code)
        emit('game_started', game_data, room=room_code)
    else:
        emit('start_error', {'message': message})

@socketio.on('submit_answer')
def handle_submit_answer(data):
    room_code = data['room_code']
    answer = data['answer']
    
    success, message = game_manager.submit_answer(room_code, request.sid, answer)
    
    if success:
        # Broadcast answer submission to room
        emit('answer_submitted', {
            'player_sid': request.sid,
            'message': message
        }, room=room_code)
        
        # Check if all answers are in and advance game state
        if game_manager.all_answers_submitted(room_code):
            game_data = game_manager.advance_game_state(room_code)
            emit('game_state_updated', game_data, room=room_code)
    else:
        emit('submit_error', {'message': message})

@socketio.on('use_power_up')
def handle_use_power_up(data):
    room_code = data['room_code']
    power_up_id = data['power_up_id']
    
    success, effect = game_manager.use_power_up(room_code, request.sid, power_up_id)
    
    if success:
        emit('power_up_used', {
            'power_up_id': power_up_id,
            'effect': effect
        }, room=room_code)
    else:
        emit('power_up_error', {'message': effect})

@socketio.on('reveal_answer')
def handle_reveal_answer(data):
    room_code = data['room_code']
    answer_index = data['answer_index']
    
    success, result = game_manager.reveal_answer(room_code, request.sid, answer_index)
    
    if success:
        emit('answer_revealed', result, room=room_code)
    else:
        emit('reveal_error', {'message': result})

@socketio.on('next_round')
def handle_next_round(data):
    room_code = data['room_code']
    
    success, game_data = game_manager.next_round(room_code, request.sid)
    
    if success:
        emit('round_started', game_data, room=room_code)
    else:
        emit('round_error', {'message': game_data})

# Static file serving
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)

