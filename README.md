# pupmap
## cs546 project

## authors
- Aeslyn Vlahos
- Bonnie Wang
- Ravisara Cheakdkaipejchara
- Shasha Alvares

## introduction
The city isn’t always the most dog friendly place, which we are taking one step towards solving with our website. This app, PupMap, is catered towards dog owners to be able to check the status of nearby dog amenities (specifically parks and canine waste dispensers). Users can log whether the waste bag dispensers are empty or full, cleanliness and busy-ness of the park. 

Users are able to create a “Pupfile” (a Dog Profile), where they can describe their dogs' favourite parks and times. Users can easily interact and see which dogs they may see on their visit to the park and they can easily explore new parks they may want to visit based on specific features like a park with turf or specific hours of operation. 

## installation
navigate to the root folder and open the terminal

download the packages to your local device from package.json first:
```
npm install
```

seed the database:
```
npm run seed
```

start the application:
```
npm start
```

## architecture
```
cs546-project/
├── config/
│   ├── mongoCollection.js    # define mongodb collections
│   ├── mongoConnection.js    # connect to mongodb
│   └── settings.js           # define server url and db name
├── data/
│   ├── biscuits.js           # biscuits functionalities
│   ├── parks.js              # parks functionalities
│   ├── ratings.js            # ratings functionalities
│   └── users.js              # users functionalities
├── public/
│   └── css             
│       └── styles.css        # stylesheet
├── routes/
│   ├── biscuits.js           # biscuits routes
│   ├── index.js              # main routes
│   ├── parks.js              # parks routes
│   ├── ratings.js            # ratings routes
│   ├── users.js              # users routes
│   └── admin.js              # admin routes
├── tasks/
│   ├── biscuits.js           # define biscuits data
│   ├── index.js              # seed all data
│   ├── parks.js              # define parks data
│   ├── ratings.js            # define ratings data
│   └── users.js              # define users data
├── views/
│   └── layouts             
│       └── main.handlebars   # default layout for all handlebars
│   ├── error.handlebars      # error page layout
│   ├── home.handlebars       # home page layout
│   ├── login.handlebars      # login page layout
│   ├── parks.handlebars      # parks page layout
│   └── profile.handlebars    # profile page layout
├── .gitignore
├── app.js
├── package.json
├── README.md
└── validation.js
```
