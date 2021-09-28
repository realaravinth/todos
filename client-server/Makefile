defualt:
	@source ./venv/bin/activate && FLASK_APP=src/app FLASK_ENV=development flask run

deps-freeze:
	@source ./venv/bin/activate && pip freeze > requirements.txt

deps-install:
	pip install -r requirements.txt

i:
	python -i ./src/app.py

lint:
	./venv/bin/pylint ./src/*
