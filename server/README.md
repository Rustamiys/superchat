# Запуск сервера
Для запуска проекта первоночально подготовьте окружение
```bash
python -m venv venv
```
Активируйте его
  Windows
  ```bash
    .\venv\Scripts\Activate
  ```
  Linux
  ```bash
    sourse .\venv\bin\activate
  ```
Установите все зависимые библиотеки
```bash
pip install fastapi uvicorn pydantic aiosqlite sqlalchemy fastapi[all]
```
Перейдите в папку server
```bash
cd server
```
  Запустите сервер
```bash
uvicorn main:app --reload
```
