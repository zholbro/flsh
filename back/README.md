# Bathroom Interactions Requirements
All interactions can just give arguments to request.args
Some toy examples of API requests can be seen in this [Postman collection](https://www.getpostman.com/collections/d9aec14b1639087cff63)
## /flsh
Request to /flsh without arguments returns all possible bathrooms.
### Optional arguments
Arguments should be exclusive; i.e. submitting multiple arguments won't join the query.
1. `rating`: Filling this returns all bathrooms >= value.
2. `gender`: Filters bathrooms by exclusive gender.
3. `latitude`,`longitude`, & `range`: Range should be expressed in miles. Unfinished, but [this](http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates) is how we would theoretically handle in implementation.
## /flsh/new
Creates a new bathroom entry, as well as other bits of data.
1. `name`: Name for Bathroom. 20 char.
2. `building`: Name for building bathroom is in. 20 char.
3. `address`: Address of building. Nominatim should handle. 80 char. Optional.
4. `floor`: Integer. Optional, default is 1.  Floor building is on. 
5. `gender`: 10 char. Should be defined in front-end as a trinary option between `male`, `female`, and `all`.
5. `cleanliness`: Float. Initial rating of bathroom quality.
6. `latitude`: FLSH will parse this parameter as float, and front-end should not use degrees/minutes/seconds notation. Ex.
`36.995769` and not `36° 59' 44.7684'' N`.
7. `longitude`: Same as above.
8. `text`: The initial review of a bathroom. Optional.
#### Expected Response
`{
    "bathrooms": [
        {
            "address": "1156 High Street",
            "building": "[KZSC Santa Cruz 88.1FM]",
            "cleanliness": 4.33,
            "floor": 0,
            "gender": "All",
            "id": 1,
            "latitude": 37.0006318,
            "longitude": -122.0563092,
            "name": "No-Locks"
        },
        {
            "address": "[redacted]",
            "building": "[redacted]",
            "cleanliness": 1,
            "floor": 0,
            "gender": "All",
            "id": 2,
            "latitude": [redacted],
            "longitude": [redacted],
            "name": "HellZone"
        }
    ]
}`
## /flsh/add_review
Adds a review to the associated bathroom, and averages reviews.
1. `id`: The ID of the bathroom in the bathroom table. /flsh should give that to you.
2. `cleanliness`: Value of cleanliness for that specific rating.
3. `text`: Review text.
#### Expected Response
Currently unicode string.
`[{'cleanliness': 3.0, 'text': u"Lock is sketchy, but there's candy nearby", 'BathID': 1, 'id': 1}, {'cleanliness': 5.0, 'text': u'i saw it in my dreams', 'BathID': 1, 'id': 2}, {'cleanliness': 5.0, 'text': u"I can't remember my dreams", 'BathID': 1, 'id': 3}]`
## /flsh/get_reviews
Gives you all reviews for a specific bathroom.
1. `id`: Above description.
## /flsh/delete
Deletes a bathroom, along with its associated review counter and all reviews associated with it.
1. `id`: ID of bathroom.
## /flsh/review_delete
Deletes a bathroom review, recalculates the average.
1. `id`: ID of review. (This is distinct from a bathroom ID)

# Generic Interactions Requirements
## /generic
Returns all generic items in database. Best handled if front-end gives some parameter like
1. `filter`: Value should be category name. i.e. `toaster`, `microwave`, `fountain`, etc.
Latitude and longitude are not implemented yet
## /generic/categories
Lists all categories of items in database. Consistient use of front-end should let end-user explicitly know what categories of item they put in database.
Not implemented as of Spring 3.
