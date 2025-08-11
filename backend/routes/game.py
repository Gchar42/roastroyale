from flask import Blueprint, request, jsonify
import json
import os

game_bp = Blueprint('game', __name__)

# Load question database
def load_questions():
    """Load questions from the content database"""
    questions = [
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
        },
        {
            "id": 4,
            "type": "cards_against_humanity",
            "category": "Roast Mode",
            "question": "The reason I got banned from the gaming Discord was _____.",
            "prompts": [
                "posting too many memes",
                "arguing about game mechanics",
                "being too competitive",
                "spoiling game endings",
                "excessive trash talking",
                "sharing inappropriate content",
                "starting drama",
                "being a keyboard warrior"
            ]
        },
        {
            "id": 5,
            "type": "family_feud",
            "category": "Pop Culture",
            "question": "Name something people pretend to understand about cryptocurrency",
            "answers": [
                {"text": "Blockchain technology", "points": 40, "rank": 1},
                {"text": "Mining process", "points": 30, "rank": 2},
                {"text": "Digital wallets", "points": 25, "rank": 3},
                {"text": "NFTs", "points": 20, "rank": 4},
                {"text": "Trading strategies", "points": 15, "rank": 5},
                {"text": "Market value", "points": 10, "rank": 6},
                {"text": "Future predictions", "points": 5, "rank": 7},
                {"text": "Technical analysis", "points": 3, "rank": 8}
            ]
        }
    ]
    return questions

@game_bp.route('/questions', methods=['GET'])
def get_questions():
    """Get all available questions"""
    questions = load_questions()
    return jsonify({"questions": questions})

@game_bp.route('/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    """Get a specific question by ID"""
    questions = load_questions()
    question = next((q for q in questions if q['id'] == question_id), None)
    
    if question:
        return jsonify({"question": question})
    else:
        return jsonify({"error": "Question not found"}), 404

@game_bp.route('/questions/random', methods=['GET'])
def get_random_question():
    """Get a random question"""
    import random
    questions = load_questions()
    question = random.choice(questions)
    return jsonify({"question": question})

@game_bp.route('/questions/category/<category>', methods=['GET'])
def get_questions_by_category(category):
    """Get questions by category"""
    questions = load_questions()
    filtered_questions = [q for q in questions if q['category'].lower() == category.lower()]
    return jsonify({"questions": filtered_questions})

@game_bp.route('/power-ups', methods=['GET'])
def get_power_ups():
    """Get all available power-ups"""
    power_ups = [
        {
            "id": "double_down",
            "name": "Double Down",
            "icon": "2️⃣",
            "description": "Double points for next prediction",
            "cost": 1,
            "type": "strategic"
        },
        {
            "id": "spy_mode",
            "name": "Spy Mode",
            "icon": "👁️",
            "description": "See other team's discussion for 30 seconds",
            "cost": 2,
            "type": "strategic"
        },
        {
            "id": "steal",
            "name": "Steal",
            "icon": "💰",
            "description": "Take the other team's points if they get it wrong",
            "cost": 2,
            "type": "strategic"
        },
        {
            "id": "chaos_card",
            "name": "Chaos Card",
            "icon": "🎲",
            "description": "Random effect that changes the game",
            "cost": 1,
            "type": "chaos"
        },
        {
            "id": "time_freeze",
            "name": "Time Freeze",
            "icon": "⏰",
            "description": "Get extra 30 seconds to discuss",
            "cost": 1,
            "type": "strategic"
        },
        {
            "id": "meme_bomb",
            "name": "Meme Bomb",
            "icon": "💣",
            "description": "Insert trending meme into current question",
            "cost": 1,
            "type": "chaos"
        }
    ]
    return jsonify({"power_ups": power_ups})

@game_bp.route('/achievements', methods=['GET'])
def get_achievements():
    """Get all available achievements"""
    achievements = [
        {
            "id": "mind_reader",
            "name": "Mind Reader",
            "description": "Predict 10 #1 answers in a row",
            "icon": "🧠",
            "rarity": "rare",
            "points": 100
        },
        {
            "id": "friendship_destroyer",
            "name": "Friendship Destroyer",
            "description": "Cause 10 arguments in friend group",
            "icon": "💀",
            "rarity": "epic",
            "points": 200
        },
        {
            "id": "meme_lord",
            "name": "Meme Lord",
            "description": "Create 25 viral moments",
            "icon": "👑",
            "rarity": "legendary",
            "points": 500
        },
        {
            "id": "clutch_player",
            "name": "Clutch Player",
            "description": "Win 5 games in final round",
            "icon": "🔥",
            "rarity": "rare",
            "points": 150
        }
    ]
    return jsonify({"achievements": achievements})

@game_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get global leaderboard"""
    # Mock leaderboard data - in real app this would come from database
    leaderboard = [
        {"rank": 1, "player": "MemeLord420", "score": 15420, "games_won": 89, "achievements": 12},
        {"rank": 2, "player": "StreamQueen", "score": 14230, "games_won": 76, "achievements": 10},
        {"rank": 3, "player": "RoastMaster", "score": 13890, "games_won": 71, "achievements": 9},
        {"rank": 4, "player": "ChaosAgent", "score": 12560, "games_won": 65, "achievements": 8},
        {"rank": 5, "player": "ViralStar", "score": 11340, "games_won": 58, "achievements": 7}
    ]
    return jsonify({"leaderboard": leaderboard})

@game_bp.route('/stats/<player_name>', methods=['GET'])
def get_player_stats(player_name):
    """Get player statistics"""
    # Mock player stats - in real app this would come from database
    stats = {
        "player_name": player_name,
        "total_games": 45,
        "games_won": 23,
        "win_rate": 51.1,
        "total_score": 8750,
        "average_score": 194.4,
        "achievements_unlocked": 6,
        "power_ups_used": 127,
        "viral_moments": 8,
        "friendship_tests_passed": 34,
        "favorite_category": "Gaming Culture",
        "best_streak": 7
    }
    return jsonify({"stats": stats})

@game_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Roast Royale Game API",
        "version": "1.0.0"
    })

