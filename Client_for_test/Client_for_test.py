import asyncio
import websockets
import requests
import json
from datetime import datetime

# URL-ы для API и WebSocket
API_BASE_URL = "http://127.0.0.1:8000/api"
WS_BASE_URL = "ws://127.0.0.1:8000/ws/chat"

# Регистрация пользователя
def register_user():
    user = {
        "name": "John",
        "surename": "Doe",
        "birthday": "1990-01-01",
        "login": "john_doe",
        "password": "password123",
    }
    response = requests.post(f"{API_BASE_URL}/users/register", json=user)
    print(response.json())

# Авторизация пользователя
def login_user():
    credentials = {
        "login": "john_doe",
        "password": "password123"
    }
    response = requests.post(f"{API_BASE_URL}/users/login", json=credentials)
    print(response.json())

# Получение списка пользователей
def get_users():
    response = requests.get(f"{API_BASE_URL}/users")
    print(response.json())

# Получение истории сообщений между двумя пользователями
def get_chat_history(user1, user2):
    response = requests.get(f"{API_BASE_URL}/messages/{user1}/{user2}")
    print(response.json())

# Подключение к WebSocket и отправка/прием сообщений
async def chat_client(user1, user2):
    uri = f"{WS_BASE_URL}/{user1}/{user2}"

    async with websockets.connect(uri) as websocket:
        print(f"Подключено к чату {user1} - {user2}")

        # Отправка сообщения
        message = {
            "senderId": user1,
            "chatId": f"{user1}-{user2}",
            "message": "Привет, как дела?",
            "sentDate": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(message))
        print(f"Отправлено сообщение: {message}")

        # Прослушивание ответов
        try:
            async for response in websocket:
                print(f"Получено сообщение: {response}")
        except websockets.ConnectionClosed as e:
            print(f"Соединение закрыто: {e}")

if __name__ == "__main__":
    # Пример использования REST API
    register_user()
    login_user()
    get_users()
    get_chat_history("john_doe", "jane_doe")

    # Пример использования WebSocket
    asyncio.run(chat_client("john_doe", "jane_doe"))
