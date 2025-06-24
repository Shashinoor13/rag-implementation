FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

ENV FLASK_APP=run.py
ENV FLASK_ENV=production

CMD ["sh", "-c", "python init_db.py && flask run --host=0.0.0.0 --port=5000"]