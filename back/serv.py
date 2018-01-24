from flask import Flask, jsonify, abort, request
from flask_restful import reqparse, abort, Api, Resource
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

class Bathroom(db.Model):
   nickname = db.Column(db.String(20), primary_key = True, nullable = False)
   building = db.Column(db.String(20), nullable = False)
   address = db.Column(db.String(80))
   floor = db.Column(db.Integer)
   gender = db.Column(db.String(10), nullable = False)
   cleanliness = db.Column(db.Float, nullable = False)
   latitude = db.Column(db.Float, nullable = False)
   longitude = db.Column(db.Float, nullable = False)
   def __init__(self, nn, bl, ad, fl, ge, cl, la, lo):
      self.nickname     = nn
      self.building     = bl
      self.address      = ad
      self.floor        = fl
      self.gender       = ge
      self.cleanliness  = cl
      self.latitude     = la
      self.longitude    = lo

@app.route('/flsh')
def echo():
   # return str(request.args.getlist('location'))
   # return str(request.method)
   if (request.args.getlist('name')):
      return "you gave me a name!"
   else:
      return "where's the name, asshole"

if __name__ == "__main__":
   app.run(debug=True)



