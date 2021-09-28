FROM python:3.8-slim-buster

LABEL org.opencontainers.image.source https://github.com/realaravinth/todos

RUN useradd -ms /bin/bash -u 1001 todo
USER todo
RUN mkdir /home/todo/app
WORKDIR /home/todo/app
RUN pip3 install virtualenv
RUN /home/todo/.local/bin/virtualenv venv
COPY requirements.txt .
RUN venv/bin/pip install -r requirements.txt
COPY . .
ENV FLASK_APP=src/app
CMD [ "venv/bin/python", "-m" , "flask", "run", "--host=0.0.0.0", "--port", "3000"]
