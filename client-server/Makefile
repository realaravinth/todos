defualt:
	FLASK_APP=src/app FLASK_ENV=development flask run

deps-freeze:
	pip freeze > requirements.txt

deps-install:
	pip install -r requirements.txt

i:
	python -i ./src/app.py

lint:
	./venv/bin/pylint ./src/*
