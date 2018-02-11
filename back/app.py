from flask import Flask, jsonify, abort, request, flash, url_for, redirect, render_template
from flask_restful import reqparse, abort, Api, Resource
from flask_sqlalchemy import SQLAlchemy
from models import *

app = Flask(__name__)
app.config['SECRET_KEY'] = 'random key'
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

@app.route('/')
def show_all():
	#return render_template('show_all.html', Bathroom = Bathroom.query.all())
	return str(Bathroom.query.all())
	 
@app.route('/new', methods = ['GET', 'POST', 'DELETE'])
def new():
   try:
		Bathrooms = Bathroom(nickname = request.form['name'], building = request.form['building'],
			address = request.form['address'], floor = request.form['floor'], gender = request.form['gender'], 
			cleanliness = request.form['cleanliness'], latitude = request.form['latitude'], request.form['longitude'])
		db.session.add(Bathrooms)
		db.session.commit()
   except:
      return jsonify(
         status = 'failure',
         msg = 'error in committing valid bathroom'), 501

@app.route('/delete', methods = ['DELETE'])
def delete():
   try:
      deletions = Bathroom.query.filter_by(nickname=request.form['name'])
      Bathroom.query.filter_by(nickname=request.form['name']).delete()
      return jsonify(
         msg = 'success',
         status = 'deletion theoretical success'), 200
   except:
      return jsonify(
         msg = 'failure',
         status = 'some exception')

if __name__ == "__main__":
	db.create_all()
	app.run(debug=True)

