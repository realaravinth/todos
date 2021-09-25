import logging
import os

from flask import Flask, render_template, session, request, redirect, url_for, make_response
import sqlite3
from flask_bcrypt import Bcrypt
from flask import g

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

DATABASE = 'databse.db'
app = Flask(__name__)
app.secret_key = bytes(os.getenv('TODO_SECRET'), 'utf-8')
app.logger.setLevel(logging.DEBUG)
bcrypt = Bcrypt(app)

init_db()

def add_task(task: str, username: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('INSERT INTO todo_tasks (name, user_id) VALUES (?, (SELECT ID from todo_users WHERE name = ?));', (task, username))
    conn.commit()

def get_tasks(username: str):
    conn = get_db()
    cur = conn.cursor()
    tasks =  cur.execute('SELECT ID, name, done FROM todo_tasks WHERE user_id = (SELECT ID from todo_users WHERE name = ?)', [username]).fetchall()
    return tasks

@app.route("/", methods=["POST", "GET"])
def index():
    if 'username' in session:
        username = session["username"]
        if request.method == 'POST':
            task = str.strip(request.form['task'])
            add_task(task, username)

        tasks = get_tasks(username)
        return render_template('index.html', tasks=tasks)
    else:
        return redirect(url_for('login'))

@app.route("/task/<id>/done", methods=["POST", "GET"])
def mark_done(id: int):
    if 'username' in session:
        username = session["username"]
        conn = get_db()
        cur = conn.cursor()
        tasks =  cur.execute('UPDATE todo_tasks SET done = 1 WHERE ID = ?  AND user_id = (SELECT ID from todo_users WHERE name = ?);', [id, username])
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    else:
        return redirect(url_for('login'))

@app.route("/task/<id>/pending", methods=["POST", "GET"])
def mark_pending(id: int):
    if 'username' in session:
        username = session["username"]
        conn = get_db()
        cur = conn.cursor()
        cur.execute('UPDATE todo_tasks SET done = 0 WHERE ID = ? AND user_id = (SELECT ID from todo_users WHERE name = ?);', [id, username])
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    else:
        return redirect(url_for('login'))

@app.route("/join", methods=["POST", "GET"])
def join():
    error = None
    if request.method == 'POST':
        username = str.strip(request.form['username'])
        password = str.strip(request.form['password'])
        confirm_password = str.strip(request.form['confirm_password'])

        if confirm_password != password:
            error = "Passwords don't match"
            return render_template('join.html', error=error)

        register(username, password)
        return redirect(url_for('login'))
    else:
        return render_template('join.html', error=error)

@app.route("/login", methods=["POST", "GET"])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if validate_login(username, password):
            resp = make_response(redirect(url_for('index')))
            session['username'] = username
            return resp
        else:
            error = 'Invalid username/password'
            return render_template('login.html', error=error)
    else:
        return render_template('login.html', error=error)

def validate_login(username: str, password: str) -> bool:
    cur = get_db().cursor()
    stored_hash = cur.execute('SELECT hash FROM todo_users WHERE name = ?', [username]).fetchone()[0]
    return stored_hash is not None and bcrypt.check_password_hash(stored_hash, password)

def register(username: str, password: str):
    stored_hash = bcrypt.generate_password_hash(password, rounds=12)
    conn = get_db();
    cur = conn.cursor()
    cur.execute('INSERT INTO todo_users (name, hash) VALUES (?, ?);', (username, stored_hash))
    conn.commit()
    conn.close()

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.teardown_appcontext
def close_connection(_exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
