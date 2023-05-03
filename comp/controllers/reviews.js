const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review  = new Review(req.body.review/* review это у  нас все name = "review[...]" из HTML */)
    review.author = req.user._id;
    campground.reviews.push(review);//только что созданный ревью мы запушируем во внутрь обьекта 
    await review.save();
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//с помощью $pull удаляем именно одно точечное ревью из массива в коллекции campgrounds
    await Review.findByIdAndDelete(reviewId);//после удаляем из коллекциии reviews
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
};