/* if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
} */
require('dotenv').config();

const express = require('express');//вызвали экспресс из нашей библиотеки (база)
const path = require('path');//вызвали для использования методов патх Модуль Node.js Path является встроенным и предоставляет набор функций для работы с путями в файловой системе.
const mongoose = require('mongoose');//вызвали монго для использования mdb
const ejsMate = require('ejs-mate');// ejs то что нужно ;)
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');//Позволяет использовать глаголы HTTP, такие как PUT или DELETE, в местах, где клиент их не поддерживает.
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet') 

const mongoSanitize = require('express-mongo-sanitize')


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

 

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});//законектились с нашей локальной базой данных
mongoose.set('useFindAndModify', false);



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});//подтверждение нашего коннекта с локальной базой данных

const app = express();//нужно для вызова функций экспресс (база)


app.engine('ejs', ejsMate) // 
app.set('view engine', 'ejs');//нужно для связи наших views c этим файлом
app.set('views', path.join(__dirname, 'views'))//нужно для связи наших views c этим файлом

app.use(express.urlencoded({ extended: true }));// use используем чтобы запускать промежуточные функции.
app.use(methodOverride('_method'));// 
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const sessionConfig = {
    name: 'chakkk',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        /* secure: true, */
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com/',
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    'https://kit.fontawesome.com/',
    'https://cdnjs.cloudflare.com/',
    'https://cdn.jsdelivr.net/'
];


const styleSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://stackpath.bootstrapcdn.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/'
];


const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/'
];


const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpc5fsziq/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/fakeUser', async(req, res) => {
    const user = new User({email: 'coltttt@gmail.com', username: 'colttt'})
    const newUser = await User.register(user, ' chicken');
    res.send(newUser);
})


app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
}); // наш домашний гет запрос


app.all('*', (req, res, next) => { 
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
});/// мы слушаем сервер 3000 и в доказательство 'Serving on port 3000'