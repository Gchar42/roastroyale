import os
import sys
from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from game_manager import GameManager

# Create Flask app with static folder for serving built React files
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'roast-royale-secret-key-2025')

# Enable CORS for all routes (allows frontend to connect from any domain)
CORS(app, origins="*")

# Initialize SocketIO with CORS support for real-time multiplayer
socketio = SocketIO(app, cors_allowed_origins="*", logger=False, engineio_logger=False)

# Initialize game manager to handle all game logic
game_manager = GameManager()

# Health check endpoint for Railway deployment
@app.route('/api/game/health')
def health_check():
    return {
        "status": "healthy",
        "service": "Roast Royale Game API",
        "version": "1.0.0",
        "players_online": game_manager.get_total_players()
    }, 200

# API endpoint to get available questions
@app.route('/api/game/questions')
def get_questions():
    return {
        "status": "success",
        "questions": game_manager.get_sample_questions()
    }, 200

# API endpoint to get game statistics
@app.route('/api/game/stats')
def get_stats():
    return {
        "status": "success",
        "stats": game_manager.get_game_stats()
    }, 200

# SocketIO Events for Real-time Multiplayer

@socketio.on('connect')
def handle_connect():
    print(f'🎮 Player connected: {request.sid}')
    emit('connected', {
        'status': 'Connected to Roast Royale server',
        'player_id': request.sid
    })

@socketio.on('disconnect')
def handle_disconnect():
    print(f'👋 Player disconnected: {request.sid}')
    # Handle player leaving game and notify other players
    game_manager.handle_player_disconnect(request.sid)

@socketio.on('create_room')
def handle_create_room(data):
    player_name = data.get('player_name', 'Anonymous')
    
    try:
        # Create new game room
        room_code = game_manager.create_room(player_name, request.sid)
        join_room(room_code)
        
        room_data = game_manager.get_room_data(room_code)
        print(f'🏠 Room created: {room_code} by {player_name}')
        
        emit('room_created', {
            'success': True,
            'room_code': room_code,
            'room_data': room_data
        })
    except Exception as e:
        print(f'❌ Error creating room: {str(e)}')
        emit('room_error', {'message': f'Failed to create room: {str(e)}'})

@socketio.on('join_room')
def handle_join_room(data):
    room_code = data.get('room_code', '').upper()
    player_name = data.get('player_name', 'Anonymous')
    
    try:
        # Add player to existing game room
        success, message = game_manager.add_player_to_room(room_code, player_name, request.sid)
        
        if success:
            join_room(room_code)
            room_data = game_manager.get_room_data(room_code)
            
            print(f'🎯 {player_name} joined room: {room_code}')
            
            # Notify all players in room about new player
            emit('room_updated', room_data, room=room_code)
            emit('join_success', {'message': message, 'room_data': room_data})
        else:
            emit('join_error', {'message': message})
    except Exception as e:
        print(f'❌ Error joining room: {str(e)}')
        emit('join_error', {'message': f'Failed to join room: {str(e)}'})

@socketio.on('start_game')
def handle_start_game(data):
    room_code = data.get('room_code')
    game_settings = data.get('settings', {})
    
    try:
        success, message = game_manager.start_game(room_code, request.sid, game_settings)
        
        if success:
            game_data = game_manager.get_game_data(room_code)
            print(f'🚀 Game started in room: {room_code}')
            emit('game_started', game_data, room=room_code)
        else:
            emit('start_error', {'message': message})
    except Exception as e:
        print(f'❌ Error starting game: {str(e)}')
        emit('start_error', {'message': f'Failed to start game: {str(e)}'})

@socketio.on('submit_answer')
def handle_submit_answer(data):
    room_code = data.get('room_code')
    answer = data.get('answer', '')
    
    try:
        success, message = game_manager.submit_answer(room_code, request.sid, answer)
        
        if success:
            # Notify room about answer submission
            emit('answer_submitted', {
                'player_sid': request.sid,
                'message': message
            }, room=room_code)
            
            # Check if all answers are submitted and advance game
            if game_manager.all_answers_submitted(room_code):
                game_data = game_manager.advance_game_state(room_code)
                emit('game_state_updated', game_data, room=room_code)
        else:
            emit('submit_error', {'message': message})
    except Exception as e:
        print(f'❌ Error submitting answer: {str(e)}')
        emit('submit_error', {'message': f'Failed to submit answer: {str(e)}'})

@socketio.on('use_chaos_card')
def handle_use_chaos_card(data):
    room_code = data.get('room_code')
    card_id = data.get('card_id')
    target_data = data.get('target_data', {})
    
    try:
        success, effect = game_manager.use_chaos_card(room_code, request.sid, card_id, target_data)
        
        if success:
            print(f'💥 Chaos card used: {card_id} in room {room_code}')
            emit('chaos_card_used', {
                'card_id': card_id,
                'effect': effect,
                'player_sid': request.sid
            }, room=room_code)
        else:
            emit('chaos_card_error', {'message': effect})
    except Exception as e:
        print(f'❌ Error using chaos card: {str(e)}')
        emit('chaos_card_error', {'message': f'Failed to use chaos card: {str(e)}'})

@socketio.on('reveal_answer')
def handle_reveal_answer(data):
    room_code = data.get('room_code')
    answer_index = data.get('answer_index')
    
    try:
        success, result = game_manager.reveal_answer(room_code, request.sid, answer_index)
        
        if success:
            emit('answer_revealed', result, room=room_code)
        else:
            emit('reveal_error', {'message': result})
    except Exception as e:
        print(f'❌ Error revealing answer: {str(e)}')
        emit('reveal_error', {'message': f'Failed to reveal answer: {str(e)}'})

@socketio.on('next_round')
def handle_next_round(data):
    room_code = data.get('room_code')
    
    try:
        success, game_data = game_manager.next_round(room_code, request.sid)
        
        if success:
            print(f'➡️ Next round started in room: {room_code}')
            emit('round_started', game_data, room=room_code)
        else:
            emit('round_error', {'message': game_data})
    except Exception as e:
        print(f'❌ Error starting next round: {str(e)}')
        emit('round_error', {'message': f'Failed to start next round: {str(e)}'})

@socketio.on('player_ready')
def handle_player_ready(data):
    room_code = data.get('room_code')
    
    try:
        success, message = game_manager.set_player_ready(room_code, request.sid)
        
        if success:
            emit('player_ready_updated', {
                'player_sid': request.sid,
                'message': message
            }, room=room_code)
            
            # Check if all players are ready
            if game_manager.all_players_ready(room_code):
                game_data = game_manager.advance_game_state(room_code)
                emit('all_players_ready', game_data, room=room_code)
        else:
            emit('ready_error', {'message': message})
    except Exception as e:
        print(f'❌ Error setting player ready: {str(e)}')
        emit('ready_error', {'message': f'Failed to set ready: {str(e)}'})

# Static file serving for React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend files and handle client-side routing"""
    static_folder_path = app.static_folder
    
    if static_folder_path is None:
        return "Static folder not configured", 404

    # If requesting a specific file that exists, serve it
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    
    # For all other routes (client-side routing), serve index.html
    index_path = os.path.join(static_folder_path, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_folder_path, 'index.html')
    else:
        return "Game not found. Please check if the frontend is built correctly.", 404

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return serve_frontend('')

@app.errorhandler(500)
def internal_error(error):
    return {
        "error": "Internal server error",
        "message": "Something went wrong on our end. Please try again."
    }, 500

if __name__ == '__main__':
    # Get port from environment variable (Railway/Render/Heroku set this automatically)
    port = int(os.environ.get('PORT', 5000))
    
    print("🎮 Starting Roast Royale Game Server...")
    print(f"🌐 Server will run on: http://0.0.0.0:{port}")
    print(f"🎯 Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print("🔥 Ready for epic roast battles!")
    
    # Start the server
    # host='0.0.0.0' allows external connections (required for Railway/cloud hosting)
    # port comes from environment variable for cloud deployment
    socketio.run(
        app, 
        host='0.0.0.0', 
        port=port, 
        debug=False,  # Set to False for production
        allow_unsafe_werkzeug=True  # Required for SocketIO in production
    )

