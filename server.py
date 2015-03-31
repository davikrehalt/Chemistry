import sqlite3
import time
import copy
from flask import Flask,request,g, render_template,redirect,abort, url_for

app = Flask(__name__)
DATABASE = 'chemistry.db'
conn=sqlite3.connect(DATABASE)
c=conn.cursor()

c.execute("CREATE TABLE if not exists substance (number, name, concent, issource)")
conn.commit()
conn.close()

subno=[0]

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
        
def db_read_sub():
    cur = get_db().cursor()
    cur.execute("SELECT * FROM substance")
    return cur.fetchall()
    
def db_add_sub(number, name, concent, issource):
    print(name,concent,issource)
    cur = get_db().cursor()
    sub_info = (number,name, concent, issource)
    cur.execute("INSERT INTO substance VALUES (?, ?, ?, ?)", sub_info)
    get_db().commit()

@app.route("/")
def hello():
    #pout = db_read_sub()
    print(url_for('static', filename='Scripts.js'))
    pout=[]
    print(pout)
    return render_template('index.html',substances=pout)
 
@app.route("/Scripts.js",methods=["GET"])
def javascript():
    return redirect(url_for('static', filename='Scripts.js'))
    
    
#@app.route("/api/substance", methods=["POST"])
def receive_sub():
    print(request.form)
    temp=copy.copy(request.form)
    if 'issource' in temp:
        db_add_sub(subno[0],temp['name'], temp['concent'],temp['issource'])
    else:
        db_add_sub(subno[0],temp['name'], temp['concent'],'False')
    subno[0]+=1
    return redirect("/")
    
if __name__ == "__main__":
    app.run()
    