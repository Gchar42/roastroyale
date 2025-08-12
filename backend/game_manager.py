import random
import string
import time
from typing import Dict, List, Optional

class GameManager:
    def __init__(self):
        self.rooms: Dict[str, Dict] = {}
        self.questions = self._load_questions()
    
    def generate_room_code(self) -> str:
        """Generate a unique 6-character room code"""
        while True:
            # Generate random 6-character code
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            # Ensure it's unique
            if code not in self.rooms:
                return code
    
    def create_room(self, host_name: str, host_sid: str) -> Dict:
        """Create a new game room"""
        try:
            room_code = self.generate_room_code()
            
            room_data = {
                'room_code': room_code,
                'host_sid': host_sid,
                'players': [
                    {
                        'name': host_name,
                        'sid': host_sid,
                        'is_host': True,
                        'score': 0,
                        'answered': False
                    }
                ],
                'game_started': False,
                'current_round': 0,
                'total_rounds': 5,
                'current_question': None,
                'scores': {host_sid: 0},
                'settings': {
                    'chaos_cards': True,
                    'roast_mode': True,
                    'viral_clips': True,
                    'trending_topics': True
                },
                'created_at': time.time()
            }
            
            self.rooms[room_code] = room_data
            
            return {
                'success': True,
                'room_code': room_code,
                'room_data': room_data
            }
        except Exception as e:
            print(f"Error creating room: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def join_room(self, room_code: str, player_name: str, player_sid: str) -> Dict:
        """Join an existing room"""
        try:
            if room_code not in self.rooms:
                return {
                    'success': False,
                    'error': 'Room does not exist'
                }
            
            room = self.rooms[room_code]
            
            # Check if player already in room
            for player in room['players']:
                if player['sid'] == player_sid:
                    return {
                        'success': True,
                        'room_data': room
                    }
            
            # Check if room is full (max 10 players)
            if len(room['players']) >= 10:
                return {
                    'success': False,
                    'error': 'Room is full'
                }
            
            # Add player to room
            new_player = {
                'name': player_name,
                'sid': player_sid,
                'is_host': False,
                'score': 0,
                'answered': False
            }
            
            room['players'].append(new_player)
            room['scores'][player_sid] = 0
            
            return {
                'success': True,
                'room_data': room
            }
        except Exception as e:
            print(f"Error joining room: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def start_game(self, room_code: str, settings: Dict) -> Dict:
        """Start the game for a room"""
        try:
            if room_code not in self.rooms:
                return {'success': False, 'error': 'Room does not exist'}
            
            room = self.rooms[room_code]
            
            if len(room['players']) < 2:
                return {'success': False, 'error': 'Need at least 2 players to start'}
            
            # Update room settings
            room['settings'].update(settings)
            room['game_started'] = True
            room['current_round'] = 1
            
            # Start first round
            return self.start_round(room_code)
        except Exception as e:
            print(f"Error starting game: {e}")
            return {'success': False, 'error': str(e)}
    
    def start_round(self, room_code: str) -> Dict:
        """Start a new round"""
        try:
            if room_code not in self.rooms:
                return {'success': False, 'error': 'Room does not exist'}
            
            room = self.rooms[room_code]
            
            # Select random question
            question = random.choice(self.questions)
            room['current_question'] = question
            
            # Reset player answered status
            for player in room['players']:
                player['answered'] = False
            
            return {
                'success': True,
                'room_data': room,
                'current_question': question
            }
        except Exception as e:
            print(f"Error starting round: {e}")
            return {'success': False, 'error': str(e)}
    
    def submit_answer(self, room_code: str, player_sid: str, answer_data: Dict) -> Dict:
        """Submit an answer for a player"""
        try:
            if room_code not in self.rooms:
                return {'success': False, 'error': 'Room does not exist'}
            
            room = self.rooms[room_code]
            
            # Find player
            player = None
            for p in room['players']:
                if p['sid'] == player_sid:
                    player = p
                    break
            
            if not player:
                return {'success': False, 'error': 'Player not found'}
            
            if player['answered']:
                return {'success': False, 'error': 'Already answered'}
            
            # Mark player as answered
            player['answered'] = True
            player['last_answer'] = answer_data
            
            # Award points (simple scoring for now)
            if answer_data.get('answer_index') is not None:
                points = 100  # Base points for answering
                room['scores'][player_sid] = room['scores'].get(player_sid, 0) + points
                player['score'] = room['scores'][player_sid]
            
            # Check if all players have answered
            all_answered = all(p['answered'] for p in room['players'])
            
            return {
                'success': True,
                'room_data': room,
                'all_answered': all_answered
            }
        except Exception as e:
            print(f"Error submitting answer: {e}")
            return {'success': False, 'error': str(e)}
    
    def next_round(self, room_code: str) -> Dict:
        """Move to the next round"""
        try:
            if room_code not in self.rooms:
                return {'success': False, 'error': 'Room does not exist'}
            
            room = self.rooms[room_code]
            
            room['current_round'] += 1
            
            if room['current_round'] > room['total_rounds']:
                # Game ended
                room['game_ended'] = True
                return {
                    'success': True,
                    'game_ended': True,
                    'final_scores': room['scores'],
                    'room_data': room
                }
            else:
                # Start next round
                return self.start_round(room_code)
        except Exception as e:
            print(f"Error advancing round: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_room(self, room_code: str) -> Optional[Dict]:
        """Get room data"""
        return self.rooms.get(room_code)
    
    def remove_player(self, room_code: str, player_sid: str) -> Dict:
        """Remove a player from a room"""
        try:
            if room_code not in self.rooms:
                return {'success': False, 'error': 'Room does not exist'}
            
            room = self.rooms[room_code]
            
            # Find and remove player
            room['players'] = [p for p in room['players'] if p['sid'] != player_sid]
            
            # Remove from scores
            if player_sid in room['scores']:
                del room['scores'][player_sid]
            
            # If no players left, delete room
            if not room['players']:
                del self.rooms[room_code]
                return {'success': True, 'room_deleted': True}
            
            # If host left, assign new host
            if not any(p['is_host'] for p in room['players']):
                room['players'][0]['is_host'] = True
            
            return {
                'success': True,
                'room_data': room
            }
        except Exception as e:
            print(f"Error removing player: {e}")
            return {'success': False, 'error': str(e)}
    
    def _load_questions(self) -> List[Dict]:
        """Load multiple choice questions"""
        return [
            {
                'id': 'gaming_1',
                'question': "What's the most annoying thing someone can do in a Discord voice chat?",
                'category': 'Gaming Culture',
                'options': [
                    "Leave their mic on while eating chips",
                    "Play music without asking",
                    "Have echo because they don't use headphones",
                    "Breathe heavily into the mic",
                    "Talk to people in their room",
                    "Join and immediately go AFK",
                    "Use voice changer constantly",
                    "Interrupt everyone mid-sentence"
                ]
            },
            {
                'id': 'social_1',
                'question': "What's the biggest red flag on someone's social media profile?",
                'category': 'Social Media',
                'options': [
                    "Only gym selfies",
                    "Inspirational quotes every day",
                    "Pictures with their ex still up",
                    "MLM posts constantly",
                    "Vague-posting about drama",
                    "No pictures of friends",
                    "Oversharing personal problems",
                    "Fake motivational content"
                ]
            },
            {
                'id': 'streaming_1',
                'question': "What makes a Twitch streamer instantly annoying?",
                'category': 'Streaming',
                'options': [
                    "Begging for follows every 5 minutes",
                    "Fake reactions to everything",
                    "Ignoring chat completely",
                    "Loud, obnoxious intro music",
                    "Constantly complaining about viewer count",
                    "Reading donations in a weird voice",
                    "Playing the same game for months",
                    "Having a toxic chat they don't moderate"
                ]
            },
            {
                'id': 'dating_1',
                'question': "What's the worst thing someone can do on a first date?",
                'category': 'Dating',
                'options': [
                    "Talk about their ex the whole time",
                    "Be rude to the waiter",
                    "Show up 30 minutes late",
                    "Spend the whole time on their phone",
                    "Order the most expensive thing",
                    "Talk only about themselves",
                    "Bring up marriage and kids",
                    "Not offer to split the bill"
                ]
            },
            {
                'id': 'work_1',
                'question': "What's the most annoying coworker behavior?",
                'category': 'Work Life',
                'options': [
                    "Microwaving fish in the office",
                    "Taking credit for your work",
                    "Having loud phone calls at their desk",
                    "Never cleaning up after themselves",
                    "Constantly complaining about everything",
                    "Sending emails that should be texts",
                    "Being passive-aggressive in meetings",
                    "Eating other people's food from the fridge"
                ]
            },
            {
                'id': 'internet_1',
                'question': "What internet trend needs to die immediately?",
                'category': 'Internet Culture',
                'options': [
                    "Fake prank videos",
                    "Overused TikTok sounds",
                    "Influencer apology videos",
                    "Clickbait thumbnails with arrows",
                    "Comment sections full of bots",
                    "Reaction videos with no commentary",
                    "Crypto/NFT spam",
                    "People filming everything in public"
                ]
            },
            {
                'id': 'food_1',
                'question': "What's the most controversial pizza topping?",
                'category': 'Food',
                'options': [
                    "Pineapple",
                    "Anchovies",
                    "Mushrooms",
                    "Olives",
                    "Pepperoni",
                    "Bell peppers",
                    "Onions",
                    "Extra cheese"
                ]
            },
            {
                'id': 'tech_1',
                'question': "What's the most annoying thing about smartphones?",
                'category': 'Technology',
                'options': [
                    "Battery dies at the worst times",
                    "Constant software updates",
                    "Apps that won't close",
                    "Autocorrect fails",
                    "Running out of storage",
                    "Cracked screens",
                    "Slow internet connection",
                    "Too many notifications"
                ]
            },
            {
                'id': 'movies_1',
                'question': "What's the worst movie theater experience?",
                'category': 'Movies',
                'options': [
                    "People talking during the movie",
                    "Someone kicking your seat",
                    "Crying babies",
                    "People on their phones",
                    "Loud chewing/crunching",
                    "Someone explaining the plot",
                    "Late arrivals blocking the screen",
                    "Overpriced snacks"
                ]
            },
            {
                'id': 'travel_1',
                'question': "What's the worst part about flying?",
                'category': 'Travel',
                'options': [
                    "Middle seat between two strangers",
                    "Crying babies on long flights",
                    "Turbulence",
                    "Delayed flights",
                    "Airport security lines",
                    "Overpriced airport food",
                    "Lost luggage",
                    "Reclining seats hitting your knees"
                ]
            },
            {
                'id': 'friends_1',
                'question': "What's the most annoying thing in a group chat?",
                'category': 'Friend Groups',
                'options': [
                    "Someone who never responds",
                    "Person who sends 20 separate messages",
                    "Someone who leaves you on read",
                    "Constant meme spam",
                    "Drama starting at 2 AM",
                    "Someone who screenshots everything",
                    "Person who changes the group name constantly",
                    "Someone who adds random people"
                ]
            },
            {
                'id': 'school_1',
                'question': "What's the worst type of group project partner?",
                'category': 'School',
                'options': [
                    "Does nothing but wants equal credit",
                    "Takes over everything",
                    "Never responds to messages",
                    "Shows up unprepared",
                    "Procrastinates until the last minute",
                    "Argues with every idea",
                    "Doesn't show up to meetings",
                    "Submits terrible quality work"
                ]
            }
        ]

