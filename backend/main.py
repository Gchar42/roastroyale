import os
import logging
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from game_manager import GameManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'roast-royale-secret-key-2025')

# Configure CORS
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Initialize SocketIO with CORS support
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    allow_unsafe_werkzeug=True
)

# Initialize Game Manager
game_manager = GameManager()

# Store connected clients
connected_clients = {}

@app.route('/')
def serve_index():
    """Serve the React app"""
    try:
        return send_file(os.path.join(app.static_folder, 'index.html'))
    except Exception as e:
        logger.error(f"Error serving index.html: {e}")
        return jsonify({'error': 'Frontend not found'}), 404

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files or fallback to index.html for client-side routing"""
    try:
        # Try to serve the static file
        return send_from_directory(app.static_folder, path)
    except:
        # Fallback to index.html for client-side routing
        try:
            return send_file(os.path.join(app.static_folder, 'index.html'))
        except Exception as e:
            logger.error(f"Error serving static file {path}: {e}")
            return jsonify({'error': 'File not found'}), 404

# API Routes
@app.route('/api/game/health')
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            'status': 'healthy',
            'rooms': len(game_manager.rooms),
            'connected_clients': len(connected_clients),
            'message': 'Roast Royale backend is running! 🔥'
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/game/questions')
def get_sample_questions():
    """Get sample questions for testing"""
    try:
        return jsonify({
            'questions': game_manager.questions[:3],  # Return first 3 questions
            'total_questions': len(game_manager.questions)
        })
    except Exception as e:
        logger.error(f"Error getting questions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/game/stats')
def get_game_stats():
    """Get game statistics"""
    try:
        return jsonify({
            'active_rooms': len(game_manager.rooms),
            'connected_players': len(connected_clients),
            'total_questions': len(game_manager.questions)
        })
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

# SocketIO Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    try:
        client_id = request.sid
        connected_clients[client_id] = {
            'connected_at': time.time(),
            'room_code': None
        }
        
        logger.info(f"🔗 Client connected: {client_id}")
        emit('connected', {
            'message': 'Connected to Roast Royale server! 🔥',
            'client_id': client_id
        })
    except Exception as e:
        logger.error(f"Connection error: {e}")
        emit('error', {'message': 'Connection failed'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    try:
        client_id = request.sid
        
        if client_id in connected_clients:
            room_code = connected_clients[client_id].get('room_code')
            if room_code:
                # Remove player from room
                result = game_manager.remove_player(room_code, client_id)
                if result.get('success'):
                    # Notify other players in the room
                    socketio.emit('room_updated', result.get('room_data'), room=room_code)
            
            del connected_clients[client_id]
        
        logger.info(f"🔌 Client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"Disconnection error: {e}")

@socketio.on('create_room')
def handle_create_room(data):
    """Handle room creation"""
    try:
        player_name = data.get('player_name', '').strip()
        client_id = request.sid
        
        # Validate input
        if not player_name or len(player_name) > 20:
            emit('room_error', {'message': 'Invalid player name'})
            return
        
        # Create room
        result = game_manager.create_room(player_name, client_id)
        
        if result.get('success'):
            room_code = result['room_code']
            room_data = result['room_data']
            
            # Join socket room
            join_room(room_code)
            
            # Update client info
            connected_clients[client_id]['room_code'] = room_code
            
            logger.info(f"🏠 Room created: {room_code} by {player_name}")
            emit('room_created', {
                'success': True,
                'room_code': room_code,
                'room_data': room_data
            })
        else:
            emit('room_error', {'message': result.get('error', 'Failed to create room')})
    
    except Exception as e:
        logger.error(f"Create room error: {e}")
        emit('room_error', {'message': 'Server error creating room'})

@socketio.on('join_room')
def handle_join_room(data):
    """Handle joining a room"""
    try:
        room_code = data.get('room_code', '').strip().upper()
        player_name = data.get('player_name', '').strip()
        client_id = request.sid
        
        # Validate input
        if not room_code or not player_name:
            emit('join_error', {'message': 'Room code and player name required'})
            return
        
        if len(player_name) > 20:
            emit('join_error', {'message': 'Player name too long'})
            return
        
        # Join room
        result = game_manager.join_room(room_code, player_name, client_id)
        
        if result.get('success'):
            room_data = result['room_data']
            
            # Join socket room
            join_room(room_code)
            
            # Update client info
            connected_clients[client_id]['room_code'] = room_code
            
            logger.info(f"👥 {player_name} joined room: {room_code}")
            
            # Notify the joining player
            emit('join_success', {
                'success': True,
                'room_data': room_data
            })
            
            # Notify other players in the room
            socketio.emit('room_updated', room_data, room=room_code)
        else:
            emit('join_error', {'message': result.get('error', 'Failed to join room')})
    
    except Exception as e:
        logger.error(f"Join room error: {e}")
        emit('join_error', {'message': 'Server error joining room'})

@socketio.on('start_game')
def handle_start_game(data):
    """Handle game start"""
    try:
        room_code = data.get('room_code')
        settings = data.get('settings', {})
        client_id = request.sid
        
        if not room_code:
            emit('game_error', {'message': 'Room code required'})
            return
        
        # Verify host
        room = game_manager.get_room(room_code)
        if not room:
            emit('game_error', {'message': 'Room not found'})
            return
        
        if room['host_sid'] != client_id:
            emit('game_error', {'message': 'Only host can start the game'})
            return
        
        # Start game
        result = game_manager.start_game(room_code, settings)
        
        if result.get('success'):
            logger.info(f"🎮 Game started in room: {room_code}")
            socketio.emit('game_started', result, room=room_code)
        else:
            emit('game_error', {'message': result.get('error', 'Failed to start game')})
    
    except Exception as e:
        logger.error(f"Start game error: {e}")
        emit('game_error', {'message': 'Server error starting game'})

@socketio.on('submit_answer')
def handle_submit_answer(data):
    """Handle answer submission"""
    try:
        room_code = data.get('room_code')
        answer_data = data.get('answer_data', {})
        client_id = request.sid
        
        if not room_code:
            emit('answer_error', {'message': 'Room code required'})
            return
        
        # Submit answer
        result = game_manager.submit_answer(room_code, client_id, answer_data)
        
        if result.get('success'):
            logger.info(f"📝 Answer submitted in room: {room_code}")
            
            # Notify all players
            socketio.emit('game_state_updated', result['room_data'], room=room_code)
            
            # If all players answered, show results
            if result.get('all_answered'):
                socketio.emit('round_ended', {
                    'show_results': True,
                    'room_data': result['room_data']
                }, room=room_code)
        else:
            emit('answer_error', {'message': result.get('error', 'Failed to submit answer')})
    
    except Exception as e:
        logger.error(f"Submit answer error: {e}")
        emit('answer_error', {'message': 'Server error submitting answer'})

@socketio.on('next_round')
def handle_next_round(data):
    """Handle next round"""
    try:
        room_code = data.get('room_code')
        client_id = request.sid
        
        if not room_code:
            emit('round_error', {'message': 'Room code required'})
            return
        
        # Verify host
        room = game_manager.get_room(room_code)
        if not room or room['host_sid'] != client_id:
            emit('round_error', {'message': 'Only host can advance rounds'})
            return
        
        # Next round
        result = game_manager.next_round(room_code)
        
        if result.get('success'):
            if result.get('game_ended'):
                logger.info(f"🏆 Game ended in room: {room_code}")
                socketio.emit('game_ended', result, room=room_code)
            else:
                logger.info(f"➡️ Next round in room: {room_code}")
                socketio.emit('round_started', result, room=room_code)
        else:
            emit('round_error', {'message': result.get('error', 'Failed to advance round')})
    
    except Exception as e:
        logger.error(f"Next round error: {e}")
        emit('round_error', {'message': 'Server error advancing round'})

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle leaving a room"""
    try:
        room_code = data.get('room_code')
        client_id = request.sid
        
        if room_code and client_id in connected_clients:
            # Remove from game room
            result = game_manager.remove_player(room_code, client_id)
            
            # Leave socket room
            leave_room(room_code)
            
            # Update client info
            connected_clients[client_id]['room_code'] = None
            
            if result.get('success') and not result.get('room_deleted'):
                # Notify remaining players
                socketio.emit('room_updated', result['room_data'], room=room_code)
            
            logger.info(f"🚪 Player left room: {room_code}")
    
    except Exception as e:
        logger.error(f"Leave room error: {e}")

@socketio.on('use_chaos_card')
def handle_chaos_card(data):
    """Handle chaos card usage"""
    try:
        room_code = data.get('room_code')
        card_type = data.get('card_type')
        client_id = request.sid
        
        # Simple chaos card implementation
        logger.info(f"⚡ Chaos card used: {card_type} in room: {room_code}")
        
        socketio.emit('chaos_card_used', {
            'card_type': card_type,
            'player_sid': client_id
        }, room=room_code)
    
    except Exception as e:
        logger.error(f"Chaos card error: {e}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors by serving the React app"""
    try:
        return send_file(os.path.join(app.static_folder, 'index.html'))
    except:
        return jsonify({'error': 'Page not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    import time
    
    # Get port from environment variable (for deployment)
    port = int(os.environ.get('PORT', 5000))
    
    logger.info("🔥 Starting Roast Royale server...")
    logger.info(f"📡 Server will run on port: {port}")
    logger.info(f"📁 Static folder: {app.static_folder}")
    logger.info(f"🎮 Questions loaded: {len(game_manager.questions)}")
    
    # Run the server
    socketio.run(
        app, 
        host='0.0.0.0', 
        port=port, 
        debug=False,
        allow_unsafe_werkzeug=True
    )

