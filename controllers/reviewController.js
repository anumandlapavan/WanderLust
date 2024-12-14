const Listing = require("../models/listingModel");
const Review = require("../models/reviewModel");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "Review added to the post.");
  res.redirect(`/listings/${listing.id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review related this post is deleted.");
  res.redirect(`/listings/${id}`);
};
