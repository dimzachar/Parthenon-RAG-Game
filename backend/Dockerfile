FROM python:3.12-slim
WORKDIR /backend/app

RUN pip install pipenv
COPY Pipfile Pipfile.lock ./
RUN pipenv install --deploy --ignore-pipfile --system
COPY backend/app .
EXPOSE 5000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]