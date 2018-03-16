"""
    models.py.
    Generic and specific models for FLSH's SQLite database
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_method
from app import db
import helper


# Bathroom model
# Columns are very evident, a specific address and floor are optional
# Variables like 'cleanliness' and 'quality' are calculated as the average

class Bathroom(db.Model):
    id = db.Column(db.Integer, primary_key = True,
        autoincrement=True)
    name = db.Column(db.String(20), nullable = False)
    building = db.Column(db.String(20), nullable = False)
    address = db.Column(db.String(80))
    floor = db.Column(db.Integer) 
    gender = db.Column(db.String(10), nullable = True)
    cleanliness = db.Column(db.Float, nullable = True)
    latitude = db.Column(db.Float, nullable = True)
    longitude = db.Column(db.Float, nullable = True)

    @property
    def serialize(self):
        return {
            'id': self.id, 'name': self.name, 'building': self.building,
            'address': self.address, 'floor': self.floor,
            'gender': self.gender, 'cleanliness': round(self.cleanliness, 2),
            'latitude': self.latitude, 'longitude': self.longitude
        }

    @hybrid_method
    def distance(self, lat, lon):
          pi = 3.14159
          lat1 = self.latitude * 3.14159 / 180
          lon1 = self.longitude * 3.14159 / 180
          lat2 = lat * pi / 180
          lon2 = lon * pi / 180
          diff = lon1 - lon2
          cosi = ((16 * lat1)*(pi - lat1))/(5*pi*pi - 4*lat1*(pi - lat1)) * ((16 * lat2)*(pi - lat2))/(5*pi*pi - 4*lat2*(pi - lat2)) + (pi*pi - 4*lat1*lat1)/(pi*pi + lat1*lat1) * (pi*pi - 4*lat2*lat2)/(pi*pi + lat2*lat2) * (pi*pi - 4*diff*diff)/(pi*pi + diff*diff)
          
          # arccos approx https://stackoverflow.com/posts/20914630/revisions
          a=1.43+0.59*cosi
          a=(a+(2+2*cosi)/a)/2
          b=1.65-1.41*cosi
          b=(b+(2-2*cosi)/b)/2
          c=0.88-0.77*cosi
          c=(c+(2-a)/c)/2
          arcl = (8*(c+(2-a)/c)-(b+(2-2*cosi)/b))/6

          radius = 3958.7608367
          return arcl * radius

    def __repr__(self):
        return repr(self.serialize)


# Per-item review counter
# We have this so the individual model for Bathroom doesn't get ridiculous
# When updating the general bathroom metadata, knowing how many times
# a bathroom has been reviewed so we can take the average of multiple
# reviews

class ReviewCount(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = False,
            autoincrement=True)
    BathID = db.Column(db.Integer, nullable = False)
    count = db.Column(db.Integer, nullable = False)
    def __repr__(self):
        return '{\'id\': %d, \'count\': %d}' % (self.BathID, self.count)

# DB entry for Bathroom reviews
# Specific reviews are pulled by querying the id
# id per review corresponds to the bathroom they are attached to
class BathroomReview(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = False,
        autoincrement=True)
    BathID = db.Column(db.Integer)
    text = db.Column(db.Text)
    cleanliness = db.Column(db.Float)
    @property
    def serialize(self):
        return {
            'id': self.id, 'BathID': self.BathID, 'text': self.text,
            'cleanliness': self.cleanliness
        }
    def __repr__(self):
        return repr(self.serialize)
        # return '{\'BathID\': %d, \'text\': %r, \'cleanliness\': \
        # %f}\n' % (self.BathID, self.text, self.cleanliness)

# Generic model
# for generic items in the DB
# they all have location data, and will have generic reviews attached to them

class Generic(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = False,
        autoincrement = True)
    category = db.Column(db.String(20), nullable = False)
    description = db.Column(db.Text, nullable = False)
    address = db.Column(db.String(80))
    building = db.Column(db.String(30), nullable = False)
    floor = db.Column(db.Integer)
    latitude = db.Column(db.Float, nullable = True)
    longitude = db.Column(db.Float, nullable = True)
    rating = db.Column(db.Float)
    count = db.Column(db.Integer)

    @property
    def serialize(self):
        return {
            'id': self.id, 'category': self.category,
            'description': self.description,
            'building': self.building, 'address': self.address,
            'floor': self.floor, 'rating': round(self.rating, 2),
            'latitude': self.latitude, 'longitude': self.longitude
        }
        
    @hybrid_method
    def distance(self, lat, lon):
          pi = 3.14159
          lat1 = self.latitude * 3.14159 / 180
          lon1 = self.longitude * 3.14159 / 180
          lat2 = lat * pi / 180
          lon2 = lon * pi / 180
          diff = lon1 - lon2
          cosi = ((16 * lat1)*(pi - lat1))/(5*pi*pi - 4*lat1*(pi - lat1)) * ((16 * lat2)*(pi - lat2))/(5*pi*pi - 4*lat2*(pi - lat2)) + (pi*pi - 4*lat1*lat1)/(pi*pi + lat1*lat1) * (pi*pi - 4*lat2*lat2)/(pi*pi + lat2*lat2) * (pi*pi - 4*diff*diff)/(pi*pi + diff*diff)
          
          # arccos approx https://stackoverflow.com/posts/20914630/revisions
          a=1.43+0.59*cosi
          a=(a+(2+2*cosi)/a)/2
          b=1.65-1.41*cosi
          b=(b+(2-2*cosi)/b)/2
          c=0.88-0.77*cosi
          c=(c+(2-a)/c)/2
          arcl = (8*(c+(2-a)/c)-(b+(2-2*cosi)/b))/6

          radius = 3958.7608367
          return arcl * radius
          
    def __repr__(self):
        return repr(self.serialize)

# DB entry for Generic reviews
# Specific reviews are pulled by querying the id
# id per review corresponds to the bathroom they are attached to
class GenericReview(db.Model):
    id = db.Column(db.Integer, primary_key = True, nullable = False,
        autoincrement=True)
    ItemID = db.Column(db.Integer)
    text = db.Column(db.Text)
    rating = db.Column(db.Float, nullable = False)
    def __repr__(self):
        return '{\'ItemID\': %d, \'text\': %r, \'cleanliness\': \
        %f}\n' % (self.ItemID, self.text, self.cleanliness)
