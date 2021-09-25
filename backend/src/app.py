from flask import Flask, render_template, session, request, redirect, url_for, make_response
import sqlite3
from flask_bcrypt import Bcrypt
from flask import g

DATABASE = 'databse.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


app = Flask(__name__)
app.secret_key = b'14c9ddcac47f1659dc67771e61bd2158'
bcrypt = Bcrypt(app)

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()


init_db()

@app.route("/")
def index():
    if 'username' in session:
        return render_template('index.html')
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
            location = format('/hello/%s' % (username))
            resp = make_response(redirect(location))
            session['username'] = username
            return resp
        else:
            error = 'Invalid username/password'
            return render_template('login.html', error=error)
    else:
        return render_template('login.html', error=error)

def validate_login(username: str, password: str) -> bool:
    cur = get_db().cursor();
    hash =  x = cur.execute('select hash from todo_users where name = ?', [username]).fetchone()[0]
    if hash is not None and bcrypt.check_password_hash(hash, password):
        return True

    else:
        return False

def register(username: str, password: str):
    hash = bcrypt.generate_password_hash(password, rounds=12)
    conn = get_db();
    cur = conn.cursor()
    cur.execute('INSERT INTO todo_users (name, hash) VALUES (?, ?);', (username, hash))
    conn.commit()
    conn.close()
    

@app.route('/logout')
def logout():
    session('username', None)
    return redirect(url_for('index'))

@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('index.html', name=name)

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
