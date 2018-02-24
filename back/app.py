from flask import Flask, jsonify, abort, request, flash, url_for, redirect, render_template
from flask_restful import reqparse, abort, Api, Resource
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SECRET_KEY'] = 'random key'
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

from models import *


@app.route('/')
def show_all_bathroom():
	#return render_template('show_all.html', Bathroom = Bathroom.query.all())
	return str(Bathroom.query.all())

@app.route('/generic')
def show_all_generic():
	#return render_template('show_all.html', Bathroom = Bathroom.query.all())
	return str(Generic.query.all())

@app.route('/new', methods = ['PUT', 'POST'])
def new():
	try:
		Bathrooms = Bathroom(nickname = request.args['name'], building = request.args['building'],
			address = request.args['address'], floor = int(request.args['floor']), gender = request.args['gender'], 
			cleanliness = float(request.args['cleanliness']), latitude = float(request.args['latitude']), longitude = float(request.args['longitude']))
		db.session.add(Bathrooms)
		db.session.commit()
		return "success in add!"
	except:
		return jsonify(
			status = 'failure',
			msg = 'error in committing valid bathroom'), 501

@app.route('/new_generic', methods = ['PUT', 'POST'])
def new_generic():
	try:
		generic = Generic(name = request.args['name'], building = request.args['building'],
			address = request.args['address'], floor = int(request.args['floor']),
			rating = float(request.args['rating']))
		db.session.add(generic)
		db.session.commit()
		return "success in add!"
	except:
		return jsonify(
			status = 'failure',
			msg = 'error in committing valid bathroom'), 501

@app.route('/delete', methods = ['DELETE'])
def delete():
	try:
		request.args = args
		deletions = Bathroom.query.filter_by(nickname=args['name'])
		Bathroom.query.filter_by(nickname=args['name']).delete()
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

