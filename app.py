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
import helper

@app.route('/')
def index():
    return render_template('index.html', Bathrooms = Bathroom.query.all())

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/flsh')
def show_all_bathroom():
    # if (('ticket' not in request.headers)
    #     or not helper.auth_request(request.headers['ticket'])):
    #     return 'failure'
    if request.method == 'POST':
        return render_template('show_all.html', Bathroom = Bathroom.query.all())
    else:
        if (request.args):
            Filter = (request.args)
            if 'rating' in Filter:
                print('nothing less than ' + Filter['rating'])
                results = Bathroom.query.filter(
                    Bathroom.cleanliness >= float(Filter['rating']))
                print([i.serialize for i in results])
            elif 'gender' in Filter:
                results = Bathroom.query.filter_by(
                    gender = Filter['gender'])
            elif 'range' in Filter:
                lat = float(Filter['lat'])
                lon = float(Filter['lon'])
                dist = float(Filter['range'])

                results = Bathroom.query.filter(
                    helper.dist_approx(
                        lat, lon, Bathroom.latitude, Bathroom.longitude) <= dist)
        else:
            results = Bathroom.query.all()
        print([i.serialize for i in results])
        return jsonify(bathrooms = [i.serialize for i in results])

@app.route('/generic')
def show_all_generic():
    if request.method == 'POST':
        return render_template('show_all.html', Bathroom = Bathroom.query.all())
    else:
        if 'category' in request.args:
            print(request.args['category'])
            results = Generic.query.filter_by(
                category = request.args['category']).all()
            return jsonify(items = [i.serialize for i in results])
        elif 'range' in request.args:
            lat = float(request.args['lat'])
            lon = float(request.args['lon'])
            dist = float(request.args['range'])
            results = Bathroom.query.filter(
                helper.dist_approx(
                    lat, lon, Bathroom.latitude, Bathroom.longitude) <= dist)
            return jsonify(items = [i.serialize for i in results])
        return jsonify(items = [i.serialize for i in Generic.query.all()])

# TODO:
# Delete bathroom/review counter if exception during method

@app.route('/flsh/new', methods = ['PUT'])
def bathroom_new():
    try:
        # Make a new bathroom
        EntryVal = eval(request.data)

        # DuplicateCheck = Bathroom.query.filter_by(latitude = float(EntryVal['latitude']),
        #                 longitude = float(EntryVal['longitude'])).first()
        # if DuplicateCheck is not None:
        #     return jsonify(
        #         status = 'failure',
        #         msg = 'duplicate entry exists'), 501

        if not helper.verify_bathroom(EntryVal):
            return jsonify(
                msg = 'failure',
                status = 'missing some parameter in data body',
                debug = str(EntryVal)), 400

        if 'cleanliness' in EntryVal:
            CleanLevels = float(EntryVal['cleanliness'])
        else:
            CleanLevels = 0.0
        Bathrooms = Bathroom(name = EntryVal['name'],
            building = EntryVal['building'], address = EntryVal['address'],
            floor = int(EntryVal['floor']), gender = EntryVal['gender'], 
            cleanliness = CleanLevels,
            latitude = float(EntryVal['latitude']),
            longitude = float(EntryVal['longitude']))

        db.session.add(Bathrooms)
        db.session.commit()

        # Make the new review counter now
        if 'cleanliness' in EntryVal:
            NewCounter = ReviewCount(BathID = Bathrooms.id, count = 1)
            db.session.add(NewCounter)
            db.session.commit()
            # Make a new review based upon the first entry
            NewReview = BathroomReview(
                BathID = Bathrooms.id,
                text = EntryVal['text'],
                cleanliness = Bathrooms.cleanliness)
            db.session.add(NewReview)
            db.session.commit()
        else:
            NewCounter = ReviewCount(BathID = Bathrooms.id, count = 0)
            db.session.add(NewCounter)
            db.session.commit()
        return jsonify(
            status = 'success',
            msg = EntryVal['name'] + ' bathroom added',
            id = Bathrooms.id), 201
    except Exception as e:
        print(e)
        return jsonify(
            status = 'failure',
            msg = 'error in committing valid bathroom'), 500

@app.route('/flsh/edit', methods = ['PUT'])
def bathroom_edit():
    try:
        EntryVal = eval(request.data)
        print(str(EntryVal))
        # Bathrooms = Bathroom.query.filter_by(id=int(EntryVal['id']))
        # this line is fucked - front end needs to include ID in body
        #Bathrooms = Bathroom.query.filter_by(latitude=float(EntryVal['latitude'])).all()
        Bathrooms = Bathroom.query.filter_by(id=int(EntryVal['id'])).all()
        if Bathrooms is None:
            return jsonify(
                status = 'failure',
                msg = 'bathroom id does not exist in database'), 400
        print("gets the right bathroom")
        print(str(Bathrooms))
        Bathrooms = Bathrooms[0]
        print('finds that first one')
        if 'name' in EntryVal:
            Bathrooms.name = EntryVal['name']
        if 'building' in EntryVal:
            Bathrooms.building = EntryVal['building']
        if 'address' in EntryVal:
            Bathrooms.address = EntryVal['address']
        if 'floor' in EntryVal:
            Bathrooms.floor = int(EntryVal['floor'])
        if 'gender' in EntryVal:
            Bathrooms.gender = EntryVal['gender']
        # if 'cleanliness' in EntryVal:
        #     Bathrooms.cleanliness = EntryVal['cleanliness']
        # if 'latitude' in EntryVal:
        #     Bathrooms.latitude = EntryVal['latitude']
        # if 'longitude' in EntryVal:
        #     Bathrooms.longitude = EntryVal['longitude']
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = 'bathroom successfully edited')
    except:
        return jsonify(
            status = 'failure',
            msg = 'error in editing valid bathroom'), 501


@app.route('/flsh/add_review', methods = ['PUT'])
def bathroom_review_add():
    try:
        EntryVal = eval(request.data)
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

@app.route('/flsh/edit_review', methods = ['PUT'])
def bathroom_review_edit():
    try:
        EntryVal = eval(request.data)

        Review = BathroomReview.query.filter_by(id=int(EntryVal['id'])).first()
        Bathrooms = Bathroom.query.filter_by(id = Review.BathID).first()
        ReviewCounter = ReviewCount.query.filter_by(BathID = Review.BathID).first()
        if Review is None or ReviewCounter is None:
            return jsonify(
                status = 'failure',
                msg = 'bathroom review does not exist in database'), 400
        # NewReview = BathroomReview(BathID = int(EntryVal['id']),
        #     text = EntryVal['text'], cleanliness = float(EntryVal['cleanliness']))
        # db.session.add(NewReview)
        if 'text' in EntryVal:
            Review.text = EntryVal['text']
        if 'cleanliness' in EntryVal:
            # Math to average out rating while considering new rating
            NewRating = Bathrooms.cleanliness * ReviewCounter.count
            NewRating += float(EntryVal['cleanliness'])
            Review.cleanliness = float(EntryVal['cleanliness'])
            NewRating -= Bathrooms.cleanliness
            NewRating /= (ReviewCounter.count)
            Bathrooms.cleanliness = NewRating
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = x.name + ' review added'), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'failure to add review'), 501

@app.route('/flsh/get_reviews', methods = ['GET'])
def bathroom_review_pull():
    try:
        EntryVal = request.args
        if 'id' not in EntryVal:
            return jsonify(
                reviews = [i.serialize for i in BathroomReview.query.all()]), 200
        x = BathroomReview.query.filter_by(BathID=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'no reviews exist for given ID'), 400
        reviews = BathroomReview.query.filter_by(BathID=int(EntryVal['id'])).all()
        return jsonify(
            reviews = [i.serialize for i in reviews]), 200
    except:
        return jsonify(
            status = 'failure',
            msg = 'request requires ID arg'), 501

@app.route('/flsh/delete', methods = ['DELETE'])
def bathroom_delete():
    try:
        EntryVal = eval(request.data)
        print(str(EntryVal))
        x = Bathroom.query.filter_by(id=int(EntryVal['id'])).first()
        print(x)
        #print("Deleting: "+x);

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
    except Exception as e:
        print(e)
        return jsonify(
            msg = 'failure',
            status = 'some exception'
        ), 501

@app.route('/flsh/review_delete', methods = ['DELETE'])
def bathroom_review_delete():
    try:
        EntryVal = eval(request.data)
        Deletion = BathroomReview.query.filter_by(id=int(EntryVal['id']))
        EntryID = Deletion.first().BathID
        Bathrooms = Bathroom.query.filter_by(id = EntryID).first()
        Count = ReviewCount.query.filter_by(BathID = EntryID).first()
        NewRating = Bathrooms.cleanliness * Count.count
        NewRating -= Deletion.cleanliness
        NewRating /= (Count.count - 1)
        Bathrooms.cleanliness = NewRating
        Count.count -= 1
        Deletion.delete()
        db.session.commit()
        return jsonify(
            msg = 'success',
            status = Bathrooms.name + ' now rated at ' + NewRating
            ), 200
    except:
        return jsonify(
            msg = 'failure',
            status = 'deleting review fail, sanitize database manually'
        ), 500


# TODO:
# Incorporate latitude and longitude for generic items
# also need new generic review counter models and
# reviews for generic items
# may also need to deal with issues in changing self.name to
# self.category
@app.route('/generic/new', methods = ['PUT', 'POST'])
def new_generic():
    try:
        EntryVal = eval(request.data)
        new_rating = 0.0
        new_count = 0
        if 'rating' in EntryVal:
            new_rating = float(EntryVal['rating'])
            new_count = 1
        generic = Generic(category = EntryVal['category'],
            description = EntryVal['description'],
            building = EntryVal['building'],
            address = EntryVal['address'], floor = int(EntryVal['floor']),
            latitude = EntryVal['latitude'], longitude = EntryVal['longitude'],
            rating = new_rating, count = new_count)
        db.session.add(generic)
        db.session.commit()
        if 'rating' in EntryVal:
            NewReview = GenericReview(ItemID = generic.id, text = EntryVal['text'],
                rating = float(EntryVal['rating']))
            db.session.add(NewReview)
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = EntryVal['category'] + ' generic added',
            id = generic.id), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'error in committing generic item'), 501

@app.route('/generic/get_reviews', methods = ['GET'])
def generic_review_pull():
    try:
        EntryVal = request.args
        if 'id' not in EntryVal:
            return jsonify(
                reviews = [i.serialize for i in Generic.query.all()]), 200
        x = GenericReview.query.filter_by(ItemID=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'no reviews exist for given ID'), 400
        reviews = GenericReview.query.filter_by(ItemID=int(EntryVal['id'])).all()
        return jsonify(
            reviews = [i.serialize for i in reviews]), 200
    except:
        return jsonify(
            status = 'failure',
            msg = 'request requires ID arg'), 501

@app.route('/generic/add_review', methods = ['PUT'])
def generic_review_add():
    try:
        EntryVal = request.data
        x = Generic.query.filter_by(id=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'ID does not correspond to any Generic item'), 400
        NewReview = GenericReview(ItemID = int(EntryVal['id']),
            text = EntryVal['text'], rating = float(EntryVal['cleanliness']))
        db.session.add(NewReview)
        db.session.commit()
        # Math to average out rating while considering new rating
        NewRating = x.rating * x.count
        NewRating += NewReview.rating
        NewRating /= (x.count + 1)
        x.count += 1;
        x.rating = NewRating
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = x.name + ' review added'), 201
    except:
        return jsonify(
            status = 'failure',
            msg = 'failure to add review'), 501

@app.route('/generic/edit', methods = ['PUT'])
def generic_edit():
    try:
        EntryVal = eval(request.data)
        # Bathrooms = Bathroom.query.filter_by(id=int(EntryVal['id']))
        # this line is fucked - front end needs to include ID in body
        #Bathrooms = Bathroom.query.filter_by(latitude=float(EntryVal['latitude'])).all()
        Generics = Generic.query.filter_by(id=int(EntryVal['id'])).all()
        if Generics is None:
            return jsonify(
                status = 'failure',
                msg = 'bathroom id does not exist in database'), 400
        Bathrooms = Bathrooms[0]
        print('finds that first one')
        if 'category' in EntryVal:
            Bathrooms.category = EntryVal['category']
        if 'building' in EntryVal:
            Bathrooms.building = EntryVal['building']
        if 'address' in EntryVal:
            Bathrooms.address = EntryVal['address']
        if 'floor' in EntryVal:
            Bathrooms.floor = int(EntryVal['floor'])
        if 'description' in EntryVal:
            Bathrooms.description = EntryVal['description']
        db.session.commit()
        return jsonify(
            status = 'success',
            msg = Generics.description + ' successfully edited')
    except:
        return jsonify(
            status = 'failure',
            msg = 'error in editing valid bathroom'), 501

@app.route('/generic/review_delete', methods = ['DELETE'])
def generic_review_delete():
    try:
        EntryVal = eval(request.data)
        Deletion = GenericReview.query.filter_by(id=int(EntryVal['id']))
        EntryID = Deletion.first().ItemID
        Item = Generic.query.filter_by(id = EntryID).first()
        NewRating = Generic.rating * Generic.count
        NewRating -= Deletion.rating
        NewRating /= (Generic.count - 1)
        Generic.rating = NewRating
        Generic.count -= 1
        Deletion.delete()
        db.session.commit()
        return jsonify(
            msg = 'success',
            status = Generic.category + 'now rated at ' + NewRating
            ), 200
    except:
        return jsonify(
            msg = 'failure',
            status = 'deleting review fail, sanitize database manually'
        ), 500

@app.route('/generic/delete', methods = ['DELETE'])
def generic_delete():
    # try:
        EntryVal = eval(request.data)
        print(int(EntryVal['id']))
        x = Generic.query.filter_by(id=int(EntryVal['id'])).first()
        if x is None:
            return jsonify(
                status = 'failure',
                msg = 'id for item does not exist in database'), 400

        Generic.query.filter_by(id=int(EntryVal['id'])).delete()
        GenericReview.query.filter_by(ItemID=int(EntryVal['id'])).delete()
        db.session.commit()
        return jsonify(
            msg = 'success',
            status = 'deletion of entries and review is success'), 200
    # except:
    #     return jsonify(
    #         msg = 'failure',
    #         status = 'some exception, no deletion'
    #     ), 500

@app.route('/auth', methods = ['GET', 'PUT'])
def authenticate():
    if 'password' in request.form:
        if (request.form['password'].lower() == app.config['SECRET_KEY'].lower()):
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
            msg = '\'password\' not given in request.form',
            debug = str(request.form)), 400


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)

