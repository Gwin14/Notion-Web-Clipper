FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instala dependências do Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install watchdog

# Copia o código da aplicação
COPY . .

EXPOSE 8000

# Executa migrações e inicia o servidor com autoreload
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]