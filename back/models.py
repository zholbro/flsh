"""
	models.py
	Generic and specific models for FLSH's SQLite database
"""

from flask_sqlalchemy import SQLAlchemy
from app import db

# Bathroom model
# Columns are very evident, a specific address and floor are optional
# Variables like 'cleanliness' and 'quality' are calculated as the average

class Bathroom(db.Model):
	id = db.Column(db.Integer, primary_key = True, nullable = False)
	name = db.Column(db.String(20), nullable = False)
	building = db.Column(db.String(20), nullable = False)
	address = db.Column(db.String(80))
	floor = db.Column(db.Integer) 
	gender = db.Column(db.String(10), nullable = True)
	cleanliness = db.Column(db.Float, nullable = True)
	latitude = db.Column(db.Float, nullable = True)
	longitude = db.Column(db.Float, nullable = True)
	def __repr__(self):
		return '{\'id\': %d, \'name\': %r, \'building\': %r, \'address\': %r,\
		\'floor\': %d, \'gender\': %r, \'cleanliness\': %f, \
		\'latitude\': %f, \'longitude\': %f}\n' % \
		(self.id, self.name, self.building, self.address, self.floor, self.gender,
			self.cleanliness, self.latitude, self.longitude)

# Generic model
# for generic items in the DB
# they all have location data, and will have generic reviews attached to them

class Generic(db.Model):
	id = db.Column(db.Integer, primary_key = True, nullable = False)
	category = db.Column(db.String(20), nullable = False)
	floor = db.Column(db.Integer)
	building = db.Column(db.String(30), nullable = False)
	address = db.Column(db.String(80))
	rating = db.Column(db.Integer)
        latitude = db.Column(db.Float, nullable = True)
        longitude = db.Column(db.Float, nullable = True)
	def __repr__(self):
		return '{\'category\': %r}\n' % self.category


# Per-item review counter
# We have this so the individual model for Bathroom doesn't get ridiculous
# When updating the general bathroom metadata, knowing how many times
# a bathroom has been reviewed so we can take the average of multiple
# reviews

class ReviewCount(db.Model):
	id = db.Column(db.Integer, primary_key = True, nullable = False)
	BathID = db.Column(db.Integer, nullable = False)
	count = db.Column(db.Integer, nullable = False)

# DB entry for Bathroom reviews
# Specific reviews are pulled by querying the id
# id per review corresponds to the bathroom they are attached to
class BathroomReview(db.Model):
	id = db.Column(db.Integer, primary_key = True,
		autoincrement=True)
	BathID = db.Column(db.Integer)
	text = db.Column(db.Text)
	cleanliness = db.Column(db.Float)
	def __repr__(self):
		return '{\'BathID\': %d, \'text\': %r, \'cleanliness\': \
		%f}\n' % (self.BathID, self.text, self.cleanliness)
