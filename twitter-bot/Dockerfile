FROM python:3.11-slim

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the database file on startup if it doesn't exist
# Expose the FastAPI port
EXPOSE 8080

CMD ["python", "main.py"]
