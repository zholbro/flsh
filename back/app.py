from flask import Flask, jsonify, abort, request, flash, url_for, redirect, render_template
from flask_restful import reqparse, abort, Api, Resource
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SECRET_KEY'] = 'random key'
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

class Bathroom(db.Model):
   nickname = db.Column(db.String(20), primary_key = True, nullable = False)
   building = db.Column(db.String(20), nullable = False)
   address = db.Column(db.String(80))
   floor = db.Column(db.Integer) 
   gender = db.Column(db.String(10), nullable = True)
   cleanliness = db.Column(db.Float, nullable = True)
   latitude = db.Column(db.Float, nullable = True)
   longitude = db.Column(db.Float, nullable = True)
  
   def __init__(self, nickname, building, address, floor, gender, cleanliness, latitude, longitude):
      self.nickname     = nickname
      self.building     = building
      self.address      = address
      self.floor        = floor
      self.gender       = gender
      self.cleanliness  = cleanliness
      self.latitude     = latitude
      self.longitude    = longitude

@app.route('/flsh')
def echo():
   # return str(request.args.getlist('location'))
   # return str(request.method)
   if (request.args.getlist('name')):
      return "you gave me a name!"
   else:
      return "where's the name, asshole"

@app.route('/')
def show_all():
   return render_template('show_all.html', Bathroom = Bathroom.query.all())
    
@app.route('/new', methods = ['GET', 'POST', 'DELETE'])
def new():
   if request.method == 'POST':
      if not request.form['name'] or not request.form['building'] or not request.form['address'] or not request.form['floor'] or not request.form['gender'] or not request.form['cleanliness'] or not request.form['latitude'] or not request.form['longitude']:
         flash('Please enter all the fields', 'error')
      else:
         Bathrooms = Bathroom(request.form['name'], request.form['building'],
            request.form['address'], request.form['floor'],request.form['gender'], 
            request.form['cleanliness'], request.form['latitude'], request.form['longitude'])
         
         db.session.add(Bathrooms)
         db.session.commit()
         
         flash('Record was successfully added')
         return redirect(url_for('show_all'))
   return render_template('new.html')

@app.route('/delete', methods = ['POST'])
def delete():

   Bathrooms = Bathroom(request.form['name'], request.form['building'],
            request.form['address'], request.form['floor'],request.form['gender'], 
            request.form['cleanliness'], request.form['latitude'], request.form['longitude'])
   
   db.session.query(Bathroom).delete()
   db.session.commit()
   
   flash('Everything Removed!')
      #return redirect(url_for('show_all'))
   return render_template('delete.html')

if __name__ == "__main__":
   db.create_all()
   app.run(debug=True)

