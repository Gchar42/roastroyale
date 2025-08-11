import random
import string
import time
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
        """Load questions from the content database"""
        questions_data = [
            {
                "id": 1,
                "type": "family_feud",
                "category": "Gaming Culture",
                "question": "What's the most annoying thing someone can do in a Discord voice chat?",
                "answers": [
                    {"text": "Breathing loudly", "points": 40, "rank": 1},
                    {"text": "Echo/feedback", "points": 30, "rank": 2},
                    {"text": "Music playing", "points": 25, "rank": 3},
                    {"text": "Eating sounds", "points": 20, "rank": 4},
                    {"text": "Background noise", "points": 15, "rank": 5},
                    {"text": "Not muting", "points": 10, "rank": 6},
                    {"text": "Keyboard clicking", "points": 5, "rank": 7},
                    {"text": "Bad microphone", "points": 3, "rank": 8}
                ]
            },
            {
                "id": 2,
                "type": "family_feud",
                "category": "Friend Dynamics",
                "question": "What's something friends always argue about when choosing a game to play?",
                "answers": [
                    {"text": "Genre preference", "points": 40, "rank": 1},
                    {"text": "Difficulty level", "points": 30, "rank": 2},
                    {"text": "Game length", "points": 25, "rank": 3},
                    {"text": "Cost/price", "points": 20, "rank": 4},
                    {"text": "Platform compatibility", "points": 15, "rank": 5},
                    {"text": "Skill level differences", "points": 10, "rank": 6},
                    {"text": "Time availability", "points": 5, "rank": 7},
                    {"text": "Personal preferences", "points": 3, "rank": 8}
                ]
            },
            {
                "id": 3,
                "type": "family_feud",
                "category": "Trending Now",
                "question": "If you had to explain the '100 men vs 1 gorilla' meme to your parents, what would you say?",
                "answers": [
                    {"text": "It's just internet humor", "points": 40, "rank": 1},
                    {"text": "Don't ask, it's weird", "points": 30, "rank": 2},
                    {"text": "People debate random things", "points": 25, "rank": 3},
                    {"text": "Gen Z finds it funny", "points": 20, "rank": 4},
                    {"text": "It's a hypothetical fight", "points": 15, "rank": 5},
                    {"text": "Makes no sense", "points": 10, "rank": 6},
                    {"text": "Viral TikTok thing", "points": 5, "rank": 7},
                    {"text": "Internet being internet", "points": 3, "rank": 8}
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
            max_players=4,
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
            return False, "Game already in progress"
        
        # Generate avatar for new player
        avatars = ["🎮", "😂", "👸", "🤖", "🦄", "🔥", "⚡", "🎯"]
        used_avatars = [p.avatar for p in room.players.values()]
        available_avatars = [a for a in avatars if a not in used_avatars]
        avatar = random.choice(available_avatars) if available_avatars else "🎮"
        
        player = Player(
            sid=player_sid,
            name=player_name,
            avatar=avatar
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
        """Get room data for broadcasting"""
        if room_code not in self.rooms:
            return None
        
        room = self.rooms[room_code]
        
        return {
            "room_code": room_code,
            "phase": room.phase.value,
            "players": [asdict(p) for p in room.players.values()],
            "teams": {k: asdict(v) for k, v in room.teams.items()},
            "current_round": room.current_round,
            "max_rounds": room.max_rounds,
            "game_mode": room.game_mode,
            "max_players": room.max_players,
            "settings": room.settings
        }
    
    def get_game_data(self, room_code: str) -> Optional[Dict]:
        """Get complete game data including current question"""
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
        
        # Select random question
        question = random.choice(self.questions)
        room.current_question = Question(**asdict(question))
        room.current_question.revealed_answers = []
        
        # Reset team answers
        for team in room.teams.values():
            team.current_answer = None
        
        # Reset player answers
        for player in room.players.values():
            player.current_answer = None
        
        room.phase = GamePhase.QUESTION
        
        return True
    
    def submit_answer(self, room_code: str, player_sid: str, answer: str) -> Tuple[bool, str]:
        """Submit a player's answer"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if player_sid not in room.players:
            return False, "Player not in room"
        
        if room.phase != GamePhase.PREDICTION:
            return False, "Not in prediction phase"
        
        player = room.players[player_sid]
        player.current_answer = answer
        
        # Update team answer (for team-based modes)
        if player.team and player.team in room.teams:
            room.teams[player.team].current_answer = answer
        
        return True, "Answer submitted"
    
    def all_answers_submitted(self, room_code: str) -> bool:
        """Check if all teams have submitted answers"""
        if room_code not in self.rooms:
            return False
        
        room = self.rooms[room_code]
        
        if room.game_mode == "ffa":
            # In FFA, check if all players have answered
            return all(p.current_answer is not None for p in room.players.values())
        else:
            # In team mode, check if all teams have answered
            return all(t.current_answer is not None for t in room.teams.values())
    
    def advance_game_state(self, room_code: str) -> Optional[Dict]:
        """Advance the game to the next state"""
        if room_code not in self.rooms:
            return None
        
        room = self.rooms[room_code]
        
        if room.phase == GamePhase.PREDICTION:
            room.phase = GamePhase.REVEAL
        elif room.phase == GamePhase.REVEAL:
            room.phase = GamePhase.ROUND_RESULTS
        elif room.phase == GamePhase.ROUND_RESULTS:
            if room.current_round >= room.max_rounds:
                room.phase = GamePhase.FINAL_RESULTS
            else:
                self.start_round(room_code)
        
        return self.get_game_data(room_code)
    
    def reveal_answer(self, room_code: str, host_sid: str, answer_index: int) -> Tuple[bool, Dict]:
        """Reveal an answer and calculate points"""
        if room_code not in self.rooms:
            return False, {"error": "Room not found"}
        
        room = self.rooms[room_code]
        
        if room.host_sid != host_sid:
            return False, {"error": "Only host can reveal answers"}
        
        if not room.current_question or answer_index >= len(room.current_question.answers):
            return False, {"error": "Invalid answer index"}
        
        if answer_index in room.current_question.revealed_answers:
            return False, {"error": "Answer already revealed"}
        
        # Reveal the answer
        room.current_question.revealed_answers.append(answer_index)
        revealed_answer = room.current_question.answers[answer_index]
        
        # Calculate points for teams that got this answer
        points_awarded = {}
        
        for team_key, team in room.teams.items():
            if team.current_answer and self._check_answer_match(team.current_answer, revealed_answer["text"]):
                team.score += revealed_answer["points"]
                points_awarded[team_key] = revealed_answer["points"]
        
        return True, {
            "answer_index": answer_index,
            "answer": revealed_answer,
            "points_awarded": points_awarded,
            "revealed_answers": room.current_question.revealed_answers
        }
    
    def _check_answer_match(self, submitted_answer: str, correct_answer: str) -> bool:
        """Check if submitted answer matches the correct answer"""
        submitted = submitted_answer.lower().strip()
        correct = correct_answer.lower().strip()
        
        # Simple matching - could be improved with fuzzy matching
        return (submitted in correct or 
                correct in submitted or 
                submitted == correct)
    
    def use_power_up(self, room_code: str, player_sid: str, power_up_id: str) -> Tuple[bool, str]:
        """Use a power-up"""
        if room_code not in self.rooms:
            return False, "Room not found"
        
        room = self.rooms[room_code]
        
        if player_sid not in room.players:
            return False, "Player not in room"
        
        player = room.players[player_sid]
        
        if power_up_id in player.power_ups_used:
            return False, "Power-up already used this round"
        
        # Apply power-up effect
        effect = self._apply_power_up_effect(room, player, power_up_id)
        player.power_ups_used.append(power_up_id)
        
        return True, effect
    
    def _apply_power_up_effect(self, room: GameRoom, player: Player, power_up_id: str) -> str:
        """Apply the effect of a power-up"""
        effects = {
            "double_down": "Next answer will be worth double points!",
            "spy_mode": "You can now see the other team's discussion!",
            "steal": "You'll steal points if the other team gets it wrong!",
            "chaos_card": "Random chaos effect activated!",
            "time_freeze": "Extra 30 seconds added to the timer!",
            "meme_bomb": "A wild meme has appeared in the question!"
        }
        
        return effects.get(power_up_id, "Power-up activated!")
    
    def next_round(self, room_code: str, host_sid: str) -> Tuple[bool, Dict]:
        """Start the next round"""
        if room_code not in self.rooms:
            return False, {"error": "Room not found"}
        
        room = self.rooms[room_code]
        
        if room.host_sid != host_sid:
            return False, {"error": "Only host can advance rounds"}
        
        if room.current_round >= room.max_rounds:
            room.phase = GamePhase.FINAL_RESULTS
            return True, self.get_game_data(room_code)
        
        # Reset for next round
        for player in room.players.values():
            player.power_ups_used = []
        
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
                
                # Remove from teams
                for team in room.teams.values():
                    if player_sid in team.players:
                        team.players.remove(player_sid)
                
                # If host disconnected, assign new host
                if room.host_sid == player_sid and room.players:
                    new_host_sid = next(iter(room.players.keys()))
                    room.host_sid = new_host_sid
                    room.players[new_host_sid].is_host = True
                
                # If room is empty, delete it
                if not room.players:
                    del self.rooms[room_code]
            
            del self.player_to_room[player_sid]

