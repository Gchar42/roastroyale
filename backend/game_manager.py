import string
import time
import random  # FIX: Added missing random import
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

class GamePhase(Enum):
    LOBBY = "lobby"
    TEAM_FORMATION = "team_formation"
    QUESTION = "question"
    PREDICTION = "prediction"
    REVEAL = "reveal"
    ROUND_RESULTS = "round_results"
    FINAL_RESULTS = "final_results"

@dataclass
class Player:
    sid: str
    name: str
    is_host: bool = False
    team: Optional[str] = None
    avatar: str = "🎮"
    score: int = 0
    current_answer: Optional[str] = None
    power_ups_used: List[str] = None
    
    def __post_init__(self):
        if self.power_ups_used is None:
            self.power_ups_used = []

@dataclass
class Team:
    name: str
    color: str
    players: List[str]  # List of player SIDs
    score: int = 0
    current_answer: Optional[str] = None
    
@dataclass
class Question:
    id: int
    type: str
    category: str
    question: str
    answers: List[Dict]
    revealed_answers: List[int] = None
    
    def __post_init__(self):
        if self.revealed_answers is None:
            self.revealed_answers = []

@dataclass
class GameRoom:
    code: str
    host_sid: str
    players: Dict[str, Player]
    teams: Dict[str, Team]
    phase: GamePhase
    current_question: Optional[Question]
    current_round: int
    max_rounds: int
    game_mode: str
    max_players: int
    created_at: float
    settings: Dict
    power_ups_available: List[str] = None
    
    def __post_init__(self):
        if self.power_ups_available is None:
            self.power_ups_available = ["double_down", "spy_mode", "steal", "chaos_card"]

class GameManager:
    def __init__(self):
        self.rooms: Dict[str, GameRoom] = {}
        self.player_to_room: Dict[str, str] = {}  # Maps player SID to room code
        self.questions = self._load_questions()
        
    def _load_questions(self) -> List[Question]:
        """Load questions from the content database - EXPANDED WITH MULTIPLE CHOICE"""
        questions_data = [
            # Gaming & Discord Questions
            {
                "id": 1,
                "type": "multiple_choice",
                "category": "Gaming Culture",
                "question": "What's the most annoying thing someone can do in a Discord voice chat?",
                "answers": [
                    {"text": "Breathing loudly into the mic", "points": 40, "rank": 1},
                    {"text": "Echo/feedback from speakers", "points": 35, "rank": 2},
                    {"text": "Playing music without asking", "points": 30, "rank": 3},
                    {"text": "Eating loudly", "points": 25, "rank": 4},
                    {"text": "Background TV/noise", "points": 20, "rank": 5},
                    {"text": "Never muting when they should", "points": 15, "rank": 6},
                    {"text": "Mechanical keyboard spam", "points": 10, "rank": 7},
                    {"text": "Terrible microphone quality", "points": 5, "rank": 8}
                ]
            },
            {
                "id": 2,
                "type": "multiple_choice",
                "category": "Gaming",
                "question": "What's the worst thing a teammate can do in an online game?",
                "answers": [
                    {"text": "Rage quit mid-game", "points": 45, "rank": 1},
                    {"text": "Blame everyone else for losing", "points": 40, "rank": 2},
                    {"text": "Go AFK without warning", "points": 35, "rank": 3},
                    {"text": "Steal your kills/loot", "points": 30, "rank": 4},
                    {"text": "Refuse to communicate", "points": 25, "rank": 5},
                    {"text": "Play music through voice chat", "points": 20, "rank": 6},
                    {"text": "Constantly backseat gaming", "points": 15, "rank": 7},
                    {"text": "Use cheats/hacks", "points": 10, "rank": 8}
                ]
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "category": "Social Media",
                "question": "What's the most cringe thing people post on social media?",
                "answers": [
                    {"text": "Gym selfies with motivational quotes", "points": 40, "rank": 1},
                    {"text": "Vague posts fishing for attention", "points": 35, "rank": 2},
                    {"text": "Every single meal they eat", "points": 30, "rank": 3},
                    {"text": "Relationship drama publicly", "points": 25, "rank": 4},
                    {"text": "Fake deep philosophical quotes", "points": 20, "rank": 5},
                    {"text": "Humble bragging constantly", "points": 15, "rank": 6},
                    {"text": "Political rants on everything", "points": 10, "rank": 7},
                    {"text": "MLM/pyramid scheme posts", "points": 5, "rank": 8}
                ]
            },
            {
                "id": 4,
                "type": "multiple_choice",
                "category": "Streaming",
                "question": "What makes a Twitch stream instantly unwatchable?",
                "answers": [
                    {"text": "Constant begging for donations", "points": 45, "rank": 1},
                    {"text": "Toxic/raging at everything", "points": 40, "rank": 2},
                    {"text": "Terrible audio quality", "points": 35, "rank": 3},
                    {"text": "Ignoring chat completely", "points": 30, "rank": 4},
                    {"text": "Boring personality/no energy", "points": 25, "rank": 5},
                    {"text": "Too many ads/interruptions", "points": 20, "rank": 6},
                    {"text": "Bad at the game they're playing", "points": 15, "rank": 7},
                    {"text": "Inappropriate content", "points": 10, "rank": 8}
                ]
            },
            {
                "id": 5,
                "type": "multiple_choice",
                "category": "Friend Groups",
                "question": "What's the most annoying friend in every group chat?",
                "answers": [
                    {"text": "The one who never responds but reads everything", "points": 45, "rank": 1},
                    {"text": "The one who sends 47 messages in a row", "points": 40, "rank": 2},
                    {"text": "The one who only talks about themselves", "points": 35, "rank": 3},
                    {"text": "The one who argues about everything", "points": 30, "rank": 4},
                    {"text": "The one who sends memes at 3 AM", "points": 25, "rank": 5},
                    {"text": "The one who screenshots private convos", "points": 20, "rank": 6},
                    {"text": "The one who leaves you on read", "points": 15, "rank": 7},
                    {"text": "The one who adds random people", "points": 10, "rank": 8}
                ]
            },
            {
                "id": 6,
                "type": "multiple_choice",
                "category": "Dating",
                "question": "What's the biggest red flag on a dating app profile?",
                "answers": [
                    {"text": "Only group photos (can't tell who they are)", "points": 45, "rank": 1},
                    {"text": "Bio says 'Just ask' or completely empty", "points": 40, "rank": 2},
                    {"text": "All photos are clearly old/filtered", "points": 35, "rank": 3},
                    {"text": "Mentions their ex in the bio", "points": 30, "rank": 4},
                    {"text": "Lists requirements like a job posting", "points": 25, "rank": 5},
                    {"text": "Only mirror selfies in bathrooms", "points": 20, "rank": 6},
                    {"text": "Gym photos showing off constantly", "points": 15, "rank": 7},
                    {"text": "Photos with expensive cars that aren't theirs", "points": 10, "rank": 8}
                ]
            },
            {
                "id": 7,
                "type": "multiple_choice",
                "category": "Work/School",
                "question": "What's the worst type of coworker/classmate?",
                "answers": [
                    {"text": "Takes credit for your work", "points": 50, "rank": 1},
                    {"text": "Never does their part in group projects", "points": 45, "rank": 2},
                    {"text": "Constantly complains but never helps", "points": 40, "rank": 3},
                    {"text": "Micromanages everything you do", "points": 35, "rank": 4},
                    {"text": "Gossips about everyone", "points": 30, "rank": 5},
                    {"text": "Always late to meetings/classes", "points": 25, "rank": 6},
                    {"text": "Eats smelly food at their desk", "points": 20, "rank": 7},
                    {"text": "Plays music without headphones", "points": 15, "rank": 8}
                ]
            },
            {
                "id": 8,
                "type": "multiple_choice",
                "category": "Internet Culture",
                "question": "What's the most overused meme format right now?",
                "answers": [
                    {"text": "Drake pointing template", "points": 40, "rank": 1},
                    {"text": "Distracted boyfriend meme", "points": 35, "rank": 2},
                    {"text": "Woman yelling at cat", "points": 30, "rank": 3},
                    {"text": "This is fine dog in fire", "points": 25, "rank": 4},
                    {"text": "Expanding brain meme", "points": 20, "rank": 5},
                    {"text": "Change my mind template", "points": 15, "rank": 6},
                    {"text": "Stonks guy", "points": 10, "rank": 7},
                    {"text": "Surprised Pikachu", "points": 5, "rank": 8}
                ]
            },
            {
                "id": 9,
                "type": "multiple_choice",
                "category": "Food",
                "question": "What's the most controversial pizza topping?",
                "answers": [
                    {"text": "Pineapple (Hawaiian)", "points": 50, "rank": 1},
                    {"text": "Anchovies", "points": 40, "rank": 2},
                    {"text": "Olives (black or green)", "points": 30, "rank": 3},
                    {"text": "Mushrooms", "points": 25, "rank": 4},
                    {"text": "Bell peppers", "points": 20, "rank": 5},
                    {"text": "Jalapeños", "points": 15, "rank": 6},
                    {"text": "Onions", "points": 10, "rank": 7},
                    {"text": "Extra cheese", "points": 5, "rank": 8}
                ]
            },
            {
                "id": 10,
                "type": "multiple_choice",
                "category": "Technology",
                "question": "What's the most annoying thing about smartphones?",
                "answers": [
                    {"text": "Battery dies at the worst moments", "points": 45, "rank": 1},
                    {"text": "Constant software updates", "points": 40, "rank": 2},
                    {"text": "Running out of storage space", "points": 35, "rank": 3},
                    {"text": "Cracked screen that cuts your finger", "points": 30, "rank": 4},
                    {"text": "Apps that won't close/keep running", "points": 25, "rank": 5},
                    {"text": "Autocorrect changing what you meant", "points": 20, "rank": 6},
                    {"text": "Spam calls and texts", "points": 15, "rank": 7},
                    {"text": "Slow internet/bad connection", "points": 10, "rank": 8}
                ]
            },
            # Add more categories and questions...
            {
                "id": 11,
                "type": "multiple_choice",
                "category": "Movies/TV",
                "question": "What ruins a movie experience the most?",
                "answers": [
                    {"text": "People talking during the movie", "points": 50, "rank": 1},
                    {"text": "Someone spoiling the ending", "points": 45, "rank": 2},
                    {"text": "Phone screens lighting up constantly", "points": 40, "rank": 3},
                    {"text": "Loud eating/crunching sounds", "points": 35, "rank": 4},
                    {"text": "Kids crying or being loud", "points": 30, "rank": 5},
                    {"text": "Someone kicking your seat", "points": 25, "rank": 6},
                    {"text": "Terrible audio quality", "points": 20, "rank": 7},
                    {"text": "Having to pee halfway through", "points": 15, "rank": 8}
                ]
            },
            {
                "id": 12,
                "type": "multiple_choice",
                "category": "Travel",
                "question": "What's the worst part about flying?",
                "answers": [
                    {"text": "Crying babies on long flights", "points": 45, "rank": 1},
                    {"text": "Person in front reclines into your space", "points": 40, "rank": 2},
                    {"text": "Middle seat between two strangers", "points": 35, "rank": 3},
                    {"text": "Delayed/cancelled flights", "points": 30, "rank": 4},
                    {"text": "Turbulence making you nauseous", "points": 25, "rank": 5},
                    {"text": "Overpriced airport food", "points": 20, "rank": 6},
                    {"text": "Security lines taking forever", "points": 15, "rank": 7},
                    {"text": "Lost luggage", "points": 10, "rank": 8}
                ]
            }
        ]
        
        return [Question(**q) for q in questions_data]
    
    def _generate_room_code(self) -> str:
        """Generate a unique room code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.rooms:
                return code
    
    def create_room(self, host_name: str, host_sid: str) -> str:
        """Create a new game room"""
        room_code = self._generate_room_code()
        
        host_player = Player(
            sid=host_sid,
            name=host_name,
            is_host=True,
            avatar="👑"
        )
        
        room = GameRoom(
            code=room_code,
            host_sid=host_sid,
            players={host_sid: host_player},
            teams={},
            phase=GamePhase.LOBBY,
            current_question=None,
            current_round=0,
            max_rounds=5,
            game_mode="2v2",
            max_players=8,
            created_at=time.time(),
            settings={}
        )
        
        self.rooms[room_code] = room
        self.player_to_room[host_sid] = room_code
        
        return room_code
    
    def add_player_to_room(self, room_code: str, player_name: str, player_sid: str) -> Tuple[bool, str]:
        """Add a player to an existing room"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if len(room.players) >= room.max_players:
            return False, "Room is full"
        
        if room.phase != GamePhase.LOBBY:
            return False, "Game already started"
        
        # Check if player name is already taken
        existing_names = [p.name for p in room.players.values()]
        if player_name in existing_names:
            return False, "Name already taken"
        
        player = Player(
            sid=player_sid,
            name=player_name,
            avatar=random.choice(["🎮", "🎯", "🎲", "🎪", "🎭", "🎨", "🎸", "🎤"])
        )
        
        room.players[player_sid] = player
        self.player_to_room[player_sid] = room_code
        
        return True, f"{player_name} joined the room"
    
    def start_game(self, room_code: str, host_sid: str, settings: Dict) -> Tuple[bool, str]:
        """Start the game"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if room.host_sid != host_sid:
            return False, "Only the host can start the game"
        
        if len(room.players) < 2:
            return False, "Need at least 2 players to start"
        
        # Update room settings
        room.settings.update(settings)
        room.game_mode = settings.get('game_mode', '2v2')
        
        # Create teams
        self._create_teams(room)
        
        # Move to team formation phase
        room.phase = GamePhase.TEAM_FORMATION
        
        return True, "Game started"
    
    def _create_teams(self, room: GameRoom):
        """Create teams based on game mode"""
        players = list(room.players.values())
        random.shuffle(players)
        
        if room.game_mode == "ffa":
            # Free for all - each player is their own team
            for i, player in enumerate(players):
                team_name = f"Team {player.name}"
                team = Team(
                    name=team_name,
                    color=f"bg-color-{i+1}",
                    players=[player.sid]
                )
                room.teams[f"team_{i+1}"] = team
                player.team = f"team_{i+1}"
        else:
            # Team-based modes
            team_size = int(room.game_mode[0])  # Extract number from "2v2", "3v3", etc.
            
            # Create two teams
            team_colors = ["bg-red-500", "bg-blue-500"]
            team_names = ["Team Chaos", "Team Mayhem"]
            
            for i in range(2):
                start_idx = i * team_size
                end_idx = min(start_idx + team_size, len(players))
                team_players = players[start_idx:end_idx]
                
                team = Team(
                    name=team_names[i],
                    color=team_colors[i],
                    players=[p.sid for p in team_players]
                )
                
                room.teams[f"team_{i+1}"] = team
                
                # Assign players to team
                for player in team_players:
                    player.team = f"team_{i+1}"
    
    def get_room_data(self, room_code: str) -> Optional[Dict]:
        """Get room data for frontend"""
        if room_code not in self.rooms:
            return None
        
        room = self.rooms[room_code]
        
        return {
            "room_code": room.code,
            "phase": room.phase.value,
            "players": [asdict(player) for player in room.players.values()],
            "teams": {k: asdict(team) for k, team in room.teams.items()},
            "current_round": room.current_round,
            "max_rounds": room.max_rounds,
            "game_mode": room.game_mode,
            "max_players": room.max_players,
            "settings": room.settings,
            "host_sid": room.host_sid
        }
    
    def get_game_data(self, room_code: str) -> Optional[Dict]:
        """Get game data including current question"""
        room_data = self.get_room_data(room_code)
        if not room_data:
            return None
        
        room = self.rooms[room_code]
        
        if room.current_question:
            room_data["current_question"] = asdict(room.current_question)
        
        return room_data
    
    def start_round(self, room_code: str) -> bool:
        """Start a new round with a random question"""
        if room_code not in self.rooms:
            return False
        
        room = self.rooms[room_code]
        room.current_round += 1
        
        # Select a random question
        room.current_question = random.choice(self.questions)
        room.phase = GamePhase.QUESTION
        
        # Reset player answers
        for player in room.players.values():
            player.current_answer = None
        
        return True
    
    def submit_answer(self, room_code: str, player_sid: str, answer: str) -> Tuple[bool, str]:
        """Submit a player's answer (now multiple choice selection)"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if player_sid not in room.players:
            return False, "Player not in room"
        
        if room.phase != GamePhase.QUESTION:
            return False, "Not in question phase"
        
        player = room.players[player_sid]
        player.current_answer = answer
        
        return True, f"{player.name} submitted their answer"
    
    def all_answers_submitted(self, room_code: str) -> bool:
        """Check if all players have submitted answers"""
        if room_code not in self.rooms:
            return False
        
        room = self.rooms[room_code]
        
        for player in room.players.values():
            if player.current_answer is None:
                return False
        
        return True
    
    def advance_game_state(self, room_code: str) -> Optional[Dict]:
        """Advance the game to the next phase"""
        if room_code not in self.rooms:
            return None
        
        room = self.rooms[room_code]
        
        if room.phase == GamePhase.QUESTION:
            room.phase = GamePhase.REVEAL
        elif room.phase == GamePhase.REVEAL:
            room.phase = GamePhase.ROUND_RESULTS
        
        return self.get_game_data(room_code)
    
    def reveal_answer(self, room_code: str, host_sid: str, answer_index: int) -> Tuple[bool, Dict]:
        """Reveal an answer and award points"""
        if room_code not in self.rooms:
            return False, {"message": "Room not found"}
        
        room = self.rooms[room_code]
        
        if room.host_sid != host_sid:
            return False, {"message": "Only host can reveal answers"}
        
        if not room.current_question:
            return False, {"message": "No current question"}
        
        if answer_index >= len(room.current_question.answers):
            return False, {"message": "Invalid answer index"}
        
        # Mark answer as revealed
        if answer_index not in room.current_question.revealed_answers:
            room.current_question.revealed_answers.append(answer_index)
        
        revealed_answer = room.current_question.answers[answer_index]
        
        # Award points to players who guessed this answer
        for player in room.players.values():
            if player.current_answer == revealed_answer["text"]:
                player.score += revealed_answer["points"]
                
                # Award points to team as well
                if player.team and player.team in room.teams:
                    room.teams[player.team].score += revealed_answer["points"]
        
        return True, {
            "answer": revealed_answer,
            "answer_index": answer_index,
            "players_who_guessed": [
                p.name for p in room.players.values() 
                if p.current_answer == revealed_answer["text"]
            ]
        }
    
    def use_power_up(self, room_code: str, player_sid: str, power_up_id: str) -> Tuple[bool, str]:
        """Use a power-up/chaos card"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if player_sid not in room.players:
            return False, "Player not in room"
        
        player = room.players[player_sid]
        
        if power_up_id in player.power_ups_used:
            return False, "Power-up already used"
        
        # Apply power-up effect
        effect = self._apply_power_up_effect(room, player, power_up_id)
        player.power_ups_used.append(power_up_id)
        
        return True, effect
    
    def _apply_power_up_effect(self, room: GameRoom, player: Player, power_up_id: str) -> str:
        """Apply the effect of a power-up"""
        effects = {
            "double_down": f"{player.name} doubled their points for this round!",
            "spy_mode": f"{player.name} can see other team's discussion!",
            "steal": f"{player.name} can steal points on wrong answers!",
            "chaos_card": f"{player.name} triggered a chaos event!"
        }
        
        return effects.get(power_up_id, "Unknown power-up used")
    
    def next_round(self, room_code: str, host_sid: str) -> Tuple[bool, Dict]:
        """Move to the next round"""
        if room_code not in self.rooms:
            return False, {"message": "Room not found"}
        
        room = self.rooms[room_code]
        
        if room.host_sid != host_sid:
            return False, {"message": "Only host can advance rounds"}
        
        if room.current_round >= room.max_rounds:
            room.phase = GamePhase.FINAL_RESULTS
            return True, self.get_game_data(room_code)
        
        # Start next round
        self.start_round(room_code)
        
        return True, self.get_game_data(room_code)
    
    def handle_player_disconnect(self, player_sid: str):
        """Handle player disconnection"""
        if player_sid in self.player_to_room:
            room_code = self.player_to_room[player_sid]
            
            if room_code in self.rooms:
                room = self.rooms[room_code]
                
                # Remove player from room
                if player_sid in room.players:
                    del room.players[player_sid]
                
                # If host disconnected, make someone else host
                if room.host_sid == player_sid and room.players:
                    new_host_sid = next(iter(room.players))
                    room.host_sid = new_host_sid
                    room.players[new_host_sid].is_host = True
                
                # If no players left, delete room
                if not room.players:
                    del self.rooms[room_code]
            
            del self.player_to_room[player_sid]
    
    def get_total_players(self) -> int:
        """Get total number of players across all rooms"""
        return sum(len(room.players) for room in self.rooms.values())
    
    def get_sample_questions(self) -> List[Dict]:
        """Get sample questions for API"""
        return [asdict(q) for q in self.questions[:5]]
    
    def get_game_stats(self) -> Dict:
        """Get game statistics"""
        return {
            "total_rooms": len(self.rooms),
            "total_players": self.get_total_players(),
            "total_questions": len(self.questions)
        }

