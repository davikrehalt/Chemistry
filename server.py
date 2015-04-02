import sqlite3
import time
import os
import copy
import json
import random
from flask import Flask,request,g, url_for
from flask import jsonify, render_template,redirect,abort
from time import gmtime, strftime

app = Flask(__name__)


DATABASE = 'chemistry.db'
conn=sqlite3.connect(DATABASE)
c=conn.cursor()

c.execute("CREATE TABLE if not exists data (time, name, content)")
conn.commit()
conn.close()

subno=[0]

port = int(os.environ.get('PORT', 5000))

def get30digits():
    return ''.join([str(random.randrange(10)) for i in range(30)])
    
def connect_db():
    return sqlite3.connect(DATABASE)

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()
        
def get_connection():
    db = getattr(g, '_db', None)
    if db is None:
        db = g._db = connect_db()
    return db
        
get_db=get_connection
def db_read_sub():
    cur = get_connection().cursor()
    cur.execute("SELECT * FROM data")
    return cur.fetchall()
    
 
def db_findnumber(number):
    print('fetch')
    print(number)
    cur = get_connection().cursor()
    cur.execute("SELECT * FROM data WHERE name =?",[number])
    out=cur.fetchall()
    if out:
        print('found')
        print(out)
        return out[0][2]
    else:
        print('No such place')
        return False
    
def db_add_sub(name, content):
    print('adding sub')
    print(name)
    print(content)
    cur = get_db().cursor()
    times=strftime("%Y-%m-%d %H:%M:%S", gmtime())
    sub_info = (times,name, str(content))
    cur.execute("INSERT INTO data VALUES (?, ?, ?)", sub_info)
    get_db().commit()
    print ('done adding')

@app.route("/")
def hello(inputtext=False):
    print(url_for('static', filename='Scripts.js'))
    if inputtext:
        pout=inputtext
    else:
        pout=[]
    print(pout)
    return render_template('index.html',entry=pout)
 
def hellocorn(environ,start_response):
    print('corn!')
    return app.load_static_file('index.html')
 
@app.route("/Scripts.js",methods=["GET"])
def javascript():
    return redirect(url_for('static', filename='Scripts.js'))
    
@app.route("/style.css",methods=["GET"])
def stylecss():
    return redirect(url_for('static', filename='style.css'))
  
@app.route("/upload",methods=["POST"])
def uploadstuff():
    print('uploadstart')
    try:
        content = request.get_json()
    except:
        print('eeeeee')
        raise
    print(content)
    print(json.dumps(content))
    tempn=get30digits()
    print(tempn)
    db_add_sub(tempn,json.dumps(content))
    subno[0]+=1
    return str(tempn)
   
@app.route('/permalink/<path:path>')
def serve_file(path):
    print('try to serve')
    print(path)
    if db_findnumber(path):
        print('something')
        print(db_findnumber(path))
        pout=db_findnumber(path)
        return hello(pout)
    else:
        print('nothing')
        return '404 nothing here'
   
 
if __name__ == "__main__":
    app.run(debug=True)
    