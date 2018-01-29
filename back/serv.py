from flask import Flask, jsonify, abort, request
from flask_restful import reqparse, abort, Api, Resource
from flask.ext.sqlalchemy import SQLAlchemy, exc
import helper

app = Flask(__name__)
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

class Bathroom(db.Model):
   id = db.Column(db.Integer, primary_key = True, nullable = False)
   building = db.Column(db.String(20), nullable = False)
   address = db.Column(db.String(80))
   floor = db.Column(db.Integer)
   gender = db.Column(db.String(10), nullable = False)
   cleanliness = db.Column(db.Float, nullable = False)
   latitude = db.Column(db.Float, nullable = False)
   longitude = db.Column(db.Float, nullable = False)

@app.route('/auth')
def auth_user():
   if (request.args.getlist('pwhash')):
      hash = request.args.getlist('pwhash')
      # authentication expects an md5sum of 'jokepassword'
      # this security is trivial and nothing private should be
      # stored on this server until this is updated
      if hash == '75d6d6902cbe2b15ad8565e7346d3416':
         return jsonify(
            msg = 'success',
            ticket = '5711ab5b9a6f33b308f0f4752f255179')
         # the ticket is the md4sum of the same password
         # mostly as a goof

@app.route('/flsh/test')
def echo():
   if name in request.args:
      return jsonify(
         msg = 'success',
         status = 'you gave me a name!'), 200
   else:
      return jsonify(
         msg = 'failure',
         status = 'where\'s the name'), 400

@app.route('/flsh/submit', methods = ['PUT'])
def submit_bathroom():
   args = request.args
   if verify_bathroom() is True:
      entry_floor = args['floor'] if 'floor' in args else ""
      entry_address = args['address'] if 'address' in args else ""
      entry = Bathroom(id = hash(args['nickname']),
         building = args['building'], address = entry_address,
         floor = entry_floor, gender = args['gender'],
         cleanliness = args['cleanliness'], latitude = args['lat'],
         longitude = args['lon'])
      try:
         db.session.add(entry)
         db.session.commit()
      except exc.SQLAlchemyError:
         return jsonify(
            msg = 'failure',
            status = 'verified entry, add failure'), 500
   else:
      return jsonify(
         msg = 'failure',
         status = 'missing non-nullable parameter'), 400

@app.route('/flsh/delete', methods = ['DELETE'])
def delete_bathroom():
   args = request.args
   if verify_bathroom() is True:
      entry_floor = int(args['floor']) if 'floor' in args else 0
      entry_address = args['address'] if 'address' in args else ""
      entry = Bathroom(id = hash(args['nickname']),
         building = args['building'], address = entry_address,
         floor = entry_floor, gender = args['gender'],
         cleanliness = args['cleanliness'], latitude = float(args['lat']),
         longitude = float(args['lon']))
      try:
         db.session.delete(entry)
         db.session.commit()
      except exc.SQLAlchemyError:
         return jsonify(
            msg = 'failure',
            status = 'verified entry, delete failure'), 500
   else:
      return jsonify(
         msg = 'failure',
         status = 'front-end failure to pull entries'), 500

@app.route('/flsh/query', methods = ['GET'])
def bathroom_query():
   args = request.args
   if ('lat' in args and'lon' in args):
      # lat = float(args['lat'])
      # lon = float(args['lon'])
      # entries = Bathroom.query.filter().all
      return jsonify(
         msg = 'failure',
         status ='location search not working'
         pins = entries), 501
   if ('gender' in args):
      entries = Bathroom.query.filter(gender = args['gender'])
      return jsonify(
         msg = 'success',
         status = 'demo gender back',
         pins = entries), 200
   else:
      return jsonify(
         msg = 'failure',
         status = "queries require columns to filter by"), 400

if __name__ == "__main__":
   app.run(debug = True)



