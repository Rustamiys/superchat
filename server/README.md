# Запуск сервера
Для запуска проекта первоночально подготовьте окружение
```bash
python -m venv venv
```
Активируйте его
```bash
.\venv\Scripts\Activate
```
Установите все зависимые библиотеки
```bash
pip install fastapi uvicorn pydantic aiosqlite sqlalchemy
```
Перейдите в папку server
```bash
cd server
```
  Запустите сервер
```bash
uvicorn main:app --reload
```
