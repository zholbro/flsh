from flask import Flask, jsonify, abort, request, flash, url_for, redirect, render_template
from flask_restful import reqparse, abort, Api, Resource
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# sha256 'croissant'
app.config['SECRET_KEY'] = ('FBB1EEB89D064F2680346A80FC5C249B'
                            'DE3F73179EBD955B226AADF6D9ABEC7B')
app.config.from_pyfile('config.py')
db = SQLAlchemy(app)

from models import *

@app.route('/flsh')
def show_all_bathroom():
    if request.method == 'POST':
        return render_template('show_all.html', Bathroom = Bathroom.query.all())
    else:
        return str(Bathroom.query.all())

@app.route('/generic')
def show_all_generic():
    if request.method == 'POST':
        return render_template('show_all.html', Bathroom = Bathroom.query.all())
    else:
        if 'filter' in request.args:
            results = Generic.query.filter_by(
                category = request.args['filter']).all()
            return str(results)
        return str(Generic.query.all())

@app.route('/auth', methods = ['GET', 'POST'])
def authenticate():
    if 'password' in request.data:
        if (request.data['password'].lower() == app.config['SECRET_KEY']):
            return jsonify(
                status = 'success',
                ticket = '5711ab5b9a6f33b308f0f4752f255179'), 200
        else:
            return jsonify(
                status = 'failure',
                msg = 'wrong password given for server, check with admin'), 400
    else:
        return jsonify(
            status = 'failure',
            msg = '\'password\' not given in request.data',
            debug = str(request.data)), 400


@app.route('/flsh/new', methods = ['PUT', 'POST'])
def new():
    try:
        # Make a new bathroom
        EntryVal = request.args
        Bathrooms = Bathroom(name = EntryVal['name'],
            building = EntryVal['building'], address = EntryVal['address'],
            floor = int(EntryVal['floor']), gender = EntryVal['gender'], 
            cleanliness = float(EntryVal['cleanliness']),
            latitude = float(EntryVal['latitude']),
            longitude = float(EntryVal['longitude']))
        db.session.add(Bathrooms)
        db.session.commit()
        # Make a new review counter by pulling the ID of the new bathroom first
        NewEntry = Bathroom.query.filter_by(name = EntryVal['name'],
                        building = EntryVal['building'], address = EntryVal['address'],
                        floor = int(EntryVal['floor']), gender = EntryVal['gender'],
                        cleanliness = float(EntryVal['cleanliness']),
                        latitude = float(EntryVal['latitude']),
                        longitude = float(EntryVal['longitude'])).first()
        # Make the new review counter now
        NewCounter = ReviewCount(BathID = NewEntry.id, count = 1)
        db.session.add(NewCounter)
        db.session.commit()
        # Make a new review based upon the first entry
        NewReview = BathroomReview(
            BathID = NewEntry.id,
            text = EntryVal['text'],
            cleanliness = NewEntry.cleanliness)
        db.session.add(NewReview)
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = EntryVal['name'] + ' bathroom added'), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'error in committing valid bathroom'), 501

@app.route('/flsh/add_review', methods = ['PUT', 'POST'])
def bathroom_review():
    try:
        EntryVal = request.args
        x = Bathroom.query.filter_by(id=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'bathroom id does not exist in database'), 400
        NewReview = BathroomReview(BathID = int(EntryVal['id']),
            text = EntryVal['text'], cleanliness = float(EntryVal['cleanliness']))
        db.session.add(NewReview)
        db.session.commit()
        ReviewCounter = ReviewCount.query.filter_by(BathID = int(EntryVal['id'])).first()
        # Math to average out rating while considering new rating
        NewRating = x.cleanliness * ReviewCounter.count
        NewRating += NewReview.cleanliness
        NewRating /= (ReviewCounter.count + 1)
        ReviewCounter.count += 1;
        x.cleanliness = NewRating
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = x.name + ' review added'), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'failure to add review'), 501

@app.route('/flsh/get_reviews', methods = ['GET', 'POST'])
def bathroom_review_pull():
    try:
        EntryVal = request.args
        if 'id' not in EntryVal:
            return str(BathroomReview.query.all())
        x = BathroomReview.query.filter_by(BathID=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'no reviews exist for given ID'), 400
        return str(BathroomReview.query.filter_by(BathID=int(EntryVal['id'])).all())
    except:
        return jsonify(
            status = 'failure',
            msg = 'request requires ID arg'), 501

# TODO:
# Incorporate latitude and longitude for generic items
# also need new generic review counter models and
# reviews for generic items
# may also need to deal with issues in changing self.name to
# self.category
@app.route('/generic/new', methods = ['PUT', 'POST'])
def new_generic():
    try:
        EntryVal = request.args
        generic = Generic(category = EntryVal['category'],
            building = EntryVal['building'],
            address = EntryVal['address'], floor = int(EntryVal['floor']),
            rating = float(EntryVal['rating']))
        db.session.add(generic)
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = EntryVal['category'] + ' generic added'), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'error in committing generic item'), 501

@app.route('/flsh/delete', methods = ['DELETE'])
def delete():
    try:
        EntryVal = request.args
        x = Bathroom.query.filter_by(id=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'bathroom id does not exist in database'), 400
        Bathroom.query.filter_by(id=int(EntryVal['id'])).delete()
        ReviewCount.query.filter_by(BathID=int(EntryVal['id'])).delete()
        BathroomReview.query.filter_by(BathID=int(EntryVal['id'])).delete()
        db.session.commit()
        return jsonify(
            msg = 'success',
            status = 'deletion theoretical success'), 200
    except:
        return jsonify(
            msg = 'failure',
            status = 'some exception'
        )

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)

