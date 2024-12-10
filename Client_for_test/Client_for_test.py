import requests

BASE_URL = "http://127.0.0.1:8000/api/users"

def print_menu():
    print("\nМеню:")
    print("1. Просмотреть всех пользователей")
    print("2. Зарегистрировать нового пользователя")
    print("3. Обновить данные пользователя")
    print("4. Удалить пользователя")
    print("5. Выйти")

def get_users():
    response = requests.get(BASE_URL)
    if response.status_code == 200:
        users = response.json()
        if users:
            print("\nСписок пользователей:")
            for user in users:
                print(f"ID: {user['id']}, Имя: {user['name']}, Фамилия: {user['surname']}")

        else:
            print("\nПользователей нет.")
    else:
        print(f"Ошибка: {response.status_code}, {response.text}")

def add_user():
    print("\nДобавление нового пользователя:")
    user_data = {
        "id": int(input("Введите ID: ")),
        "name": input("Введите имя: "),
        "surname": input("Введите фамилию: "),
        "birthday": input("Введите дату рождения (YYYY-MM-DD): "),
        "username": input("Введите логин: "),
        "password": input("Введите пароль: ")
    }
    response = requests.post(BASE_URL+"/register", json=user_data)
    if response.status_code == 200:
        print("Пользователь успешно добавлен:", response.json())
    else:
        print(f"Ошибка: {response.status_code}, {response.text}")

def update_user():
    print("\nОбновление данных пользователя:")
    user_id = int(input("Введите ID пользователя, которого хотите обновить: "))
    updated_data = {
        "id": user_id,
        "name": input("Введите новое имя: "),
        "surname": input("Введите новую фамилию: "),
        "birthday": input("Введите новую дату рождения (YYYY-MM-DD): "),
        "username": input("Введите новый логин: "),
        "password": input("Введите новый пароль: ")
    }
    response = requests.put(f"{BASE_URL}/{user_id}", json=updated_data)
    if response.status_code == 200:
        print("Пользователь успешно обновлен:", response.json())
    else:
        print(f"Ошибка: {response.status_code}, {response.text}")

def delete_user():
    print("\nУдаление пользователя:")
    user_id = int(input("Введите ID пользователя для удаления: "))
    response = requests.delete(f"{BASE_URL}/{user_id}")
    if response.status_code == 200:
        print(response.json()["message"])
    else:
        print(f"Ошибка: {response.status_code}, {response.text}")

def main():
    while True:
        print_menu()
        choice = input("\nВыберите опцию: ")
        if choice == "1":
            get_users()
        elif choice == "2":
            add_user()
        elif choice == "3":
            update_user()
        elif choice == "4":
            delete_user()
        elif choice == "5":
            print("Выход из клиента.")
            break
        else:
            print("Неверный выбор. Попробуйте снова.")

if __name__ == "__main__":
    main()


# import asyncio
# import websockets
# import json
#
# async def websocket_client():
#     uri = "ws://127.0.0.1:8000/ws/chat"
#     username = input("Введите ваш логин для чата: ")
#
#     async with websockets.connect(f"{uri}?username={username}") as websocket:
#         print("Вы подключились к чату. Пишите сообщения!")
#         # Задаем асинхронную задачу для получения сообщений
#         asyncio.create_task(receive_messages(websocket))
#
#         while True:
#             message = input("Вы: ")
#             if message.lower() == "/exit":
#                 print("Выход из чата...")
#                 break
#             await websocket.send(json.dumps({"message": message}))
#
# async def receive_messages(websocket):
#     """Получение сообщений от сервера."""
#     try:
#         while True:
#             response = await websocket.recv()
#             data = json.loads(response)
#             print(f"{data['from']}: {data['message']}")
#     except websockets.exceptions.ConnectionClosed:
#         print("Соединение закрыто.")
#
# if __name__ == "__main__":
#     asyncio.run(websocket_client())
