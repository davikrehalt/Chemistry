import sqlite3
import time
import os
import copy
import random
from flask import Flask,request,g, url_for
from flask import jsonify, render_template,redirect,abort

app = Flask(__name__)
DATABASE = 'chemistry.db'
conn=sqlite3.connect(DATABASE)
c=conn.cursor()

c.execute("CREATE TABLE if not exists data (number, name, content)")
conn.commit()
conn.close()

subno=[0]
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
        
def db_read_sub():
    cur = get_connection().cursor()
    cur.execute("SELECT * FROM data")
    return cur.fetchall()
    
 
def db_findnumber(number):
    print('fetch')
    print(db_read_sub())
    print(number)
    cur = get_connection().cursor()
    out=cur.execute("SELECT * FROM data WHERE name =?",[number])
    print('hi')
    if out:
        print('found')
        return cur.fetchall()[0][2]
    else:
        print('No such place')
        return "404"
    
def db_add_sub(number, name, content):
    print('adding sub')
    print(number)
    print(name)
    print(content)
    cur = get_db().cursor()
    sub_info = (number,name, str(content))
    cur.execute("INSERT INTO data VALUES (?, ?, ?)", sub_info)
    get_db().commit()
    print ('done adding')

@app.route("/")
def hello():
    print(url_for('static', filename='Scripts.js'))
    pout=[]
    print(pout)
    return render_template('index.html',entry=pout)
 
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
        content = request.get_json(force=True)
    except:
        print('eeeeee')
        raise
    print(content)
    tempn=get30digits()
    print(tempn)
    db_add_sub(subno[0],tempn,content)
    subno[0]+=1
    return str(tempn)
   
@app.route('/permalink/<path:path>')
def serve_file(path):
    print('try to serve')
    if len(db_findnumber(path))>0:
        print('something')
        return str(db_findnumber(path))
    else:
        print('nothing')
        return '404 nothing here'
   
 
if __name__ == "__main__":
    app.run(debug=True)
    