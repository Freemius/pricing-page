import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import jQuery from 'jquery';
import md5 from 'md5';
import Icon from "../Icon";
import CircleButton from "./CircleButton"

/**
 * @author Leo Fajardo
 */
class Testimonials extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);

        this.getReviewRating = this.getReviewRating.bind(this);
    }

    /**
     * @param {object} review
     *
     * @return {Array} Returns an array of star icons which represent the review's rating (e.g.: 5 stars).
     */
    getReviewRating(review) {
        let rate  = Math.ceil(5 * (review.rate / 100)),
            stars = [];

        for (let j = 0; j < rate; j ++) {
            stars.push(<Icon key={j} icon={['fas', 'star']} />);
        }

        return stars;
    }

    render() {
        if ( ! this.context || 0 === this.context.reviews.length ) {
            return <Fragment></Fragment>;
        }

        let pricingData = this.context;

        (function($) {
            setTimeout(function() {
                let carouselInterval    = null,
                    firstVisibleIndex   = 0,
                    maxVisibleReviews   = 3,
                    $testimonialSection = $('.fs-section-testimonials'),
                    $testimonials       = $testimonialSection.find('.fs-testimonial'),
                    $clones             = $testimonialSection.find('.fs-testimonial.clone'),
                    uniqueTestimonials  = ($testimonials.length - $clones.length),
                    $quoteContainers    = $testimonialSection.find('.fs-testimonial-message'),
                    $track              = $testimonialSection.find('.fs-testimonials'),
                    sectionWidth,
                    cardMinWidth        = 250,
                    visibleCards,
                    cardWidth,
                    speed               = 10000,
                    isCarouselActive    = false;

                let slide = function (selectedIndex, isInvisible)
                {
                    isInvisible = isInvisible || false;

                    if (isInvisible)
                        $testimonialSection.removeClass('ready');

                    let shiftedIndex   = maxVisibleReviews + selectedIndex,
                        selectedBullet = ((selectedIndex % uniqueTestimonials) + uniqueTestimonials) % uniqueTestimonials;

                    $testimonialSection.find('.slick-dots li.selected').removeClass('selected');
                    $testimonialSection.find('.slick-dots li[data-index=' + selectedBullet + ']').addClass('selected');

                    $track.css('left',  (-1)*(shiftedIndex * cardWidth) + 'px');
                    $testimonials.attr('aria-hidden', 'true');
                    for (var i = 0; i < visibleCards; i++){
                        $($testimonials[i + shiftedIndex]).attr('aria-hidden', 'false');
                    }

                    if (isInvisible)
                        setTimeout(function(){
                            $testimonialSection.addClass('ready');
                        }, 500);

                    if (selectedIndex == uniqueTestimonials){
                        // Jump back to first testimonial without a transition.
                        firstVisibleIndex = 0;

                        setTimeout(function(){
                            slide(firstVisibleIndex, true);
                        }, 1000);
                    }

                    if (selectedIndex == -visibleCards){
                        // Jump forward to relevant testimonial.
                        firstVisibleIndex = selectedIndex + uniqueTestimonials;

                        setTimeout(function(){
                            slide(firstVisibleIndex, true);
                        }, 1000);
                    }
                };

                let clearSliderInterval = function ()
                {
                    if (carouselInterval) {
                        clearInterval(carouselInterval);
                        carouselInterval = null;
                    }
                };

                let nextSlide = function ()
                {
                    firstVisibleIndex++;
                    slide(firstVisibleIndex);
                };

                let prevSlide = function ()
                {
                    firstVisibleIndex--;
                    slide(firstVisibleIndex);
                };

                let startSliderInterval = function ()
                {
                    if (!isCarouselActive)
                        return;

                    if (visibleCards < $testimonials.length)
                        carouselInterval = setInterval(function(){
                            nextSlide();
                        }, speed);
                };

                let adjustTestimonials = function ()
                {
                    clearSliderInterval();

                    $testimonialSection.removeClass('ready');

                    sectionWidth = $('.fs-testimonials-track').width();
                    visibleCards = Math.min(maxVisibleReviews, Math.floor(sectionWidth / cardMinWidth));
                    cardWidth = Math.floor(sectionWidth / visibleCards);

                    $quoteContainers.height('auto');
                    $track.width($testimonials.length * cardWidth);
                    $testimonials.width(cardWidth);

                    var maxHeight = 0;
                    for (var i = 0; i < $quoteContainers.length; i++){
                        maxHeight = Math.max(maxHeight, $($quoteContainers[i]).height());
                    }

                    // Add profile picture space.
                    maxHeight = maxHeight + 40;

                    $quoteContainers.height(maxHeight + 'px');

                    $track.css('left',  (-1)*((firstVisibleIndex + maxVisibleReviews) * cardWidth) + 'px');

                    $testimonialSection.addClass('ready');

                    isCarouselActive = (uniqueTestimonials > visibleCards);

                    // Show/hide carousel buttons.
                    $testimonialSection.find('.slick-arrow, .slick-dots').toggle(isCarouselActive);
                };

                adjustTestimonials();

                startSliderInterval();

                $testimonialSection.find('.fs-nav-next').click(function(){
                    clearSliderInterval();
                    nextSlide();
                    startSliderInterval();
                });

                $testimonialSection.find('.fs-nav-prev').click(function(){
                    clearSliderInterval();
                    prevSlide();
                    startSliderInterval();
                });

                $testimonialSection.find('.slick-dots li').click(function(){
                    if ($(this).hasClass('selected'))
                        return;

                    clearSliderInterval();
                    firstVisibleIndex = parseInt($(this).attr('data-index'));
                    slide(firstVisibleIndex);
                    startSliderInterval();
                });

                $(window).resize(function(){
                    adjustTestimonials();

                    startSliderInterval();
                });
            }, 3000);
        })(jQuery);

        let reviews           = [];
        let maxVisibleReviews = 3;
        let reviewsCount      = pricingData.reviews.length;
        let dots              = [];

        for (let i = -maxVisibleReviews; i < reviewsCount + maxVisibleReviews; i ++) {
            let review = pricingData.reviews[(i % reviewsCount + reviewsCount) % reviewsCount];

            let defaultPicIndex = review.email ?
                ((review.email.charAt(0).toLowerCase()).charCodeAt(0) - ('a').charCodeAt(0)) % 5 :
                Math.floor(Math.random() * 4);

            let defaultPicUrl = 'https://dashboard.freemius.com/assets/img/fs/profile-pics/profile-pic-' + defaultPicIndex + '.png';

            reviews.push(
                <section className={'fs-testimonial' + ((i < 0 || i >= reviewsCount) ? ' clone' : '')} data-index={i} data-id={review.id} key={i}>
                    <header className="fs-testimonial-header">
                        <div className="fs-testimonial-logo">
                            <img src={
                                review.email ?
                                    '//gravatar.com/avatar/' + md5(review.email) + '?s=80&d=' . encodeURIComponent(defaultPicUrl) :
                                    defaultPicUrl
                            } />
                        </div>
                        <h4>{review.title}</h4>
                        <div className="fs-testimonial-rating">
                            {this.getReviewRating(review)}
                        </div>
                    </header>
                    <section>
                        <Icon icon={['fas', 'quote-left']} className="fs-icon-quote" />
                        <blockquote className="fs-testimonial-message">{review.text}</blockquote>
                        <section className="fs-testimonial-author">
                            <div className="fs-testimonial-author-name">{review.name}</div>
                            <div>{review.job_title ? review.job_title + ', ' : ''}{review.company}</div>
                        </section>
                    </section>
                </section>
            );
        }

        for (let i = 0; i < reviewsCount; i ++) {
            dots.push(
                <li className={(0 == i) ? 'selected' : ''} key={i} data-index={i}
                    aria-hidden="true" role="presentation"
                    aria-selected={(0 == i) ? 'true' : 'false'}
                    aria-controls={'navigation' + i}>
                    <CircleButton type="button" role="button" tabIndex="0" />
                </li>
            );
        }

        return (
            <Fragment>
                {pricingData.active_installs > 1000 &&
                    <header className="fs-section-header"><h2>Trusted by More Than { Math.ceil(pricingData.active_installs/1000) * 1000 } Blogs, Online Shops & Websites!</h2></header>
                }
                {pricingData.active_installs <= 1000 && pricingData.downloads > 1000 &&
                    <header className="fs-section-header"><h2>Downloaded more than { Math.ceil(pricingData.downloads/1000) * 1000 } times!</h2></header>
                }
                <section className="fs-testimonials-nav">
                    <nav className="fs-nav fs-nav-prev"><Icon icon={['fas', 'arrow-left']}/></nav>
                    <div className="fs-testimonials-track">
                        <section className="fs-testimonials">{reviews}</section>
                    </div>
                    <nav className="fs-nav fs-nav-next"><Icon icon={['fas', 'arrow-right']}/></nav>
                </section>
                <ul className="fs-nav fs-nav-pagination slick-dots" role="tablist">{dots}</ul>
            </Fragment>
        );
    }
}

export default Testimonials;