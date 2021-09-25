defualt:
	cd src && flask run

deps-freeze:
	pip freeze > requirements.txt

deps-install:
	pip install -r requirements.txt

i:
	python -i ./src/app.py

lint:
	./venv/bin/pylint ./src/*
