import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import md5 from 'md5';
import Icon from "../Icon";
import RoundButton from "./RoundButton"
import {Helper} from "../../Helper";
import defaultProfilePic0 from '../.././assets/img/fs/profile-pic-0.png';
import defaultProfilePic1 from '../.././assets/img/fs/profile-pic-1.png';
import defaultProfilePic2 from '../.././assets/img/fs/profile-pic-2.png';
import defaultProfilePic3 from '../.././assets/img/fs/profile-pic-3.png';
import defaultProfilePic4 from '../.././assets/img/fs/profile-pic-4.png';

/**
 * @author Leo Fajardo
 */
class Testimonials extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);

        this.getReviewRating = this.getReviewRating.bind(this);

        this.defaultProfilePics = [
            defaultProfilePic0,
            defaultProfilePic1,
            defaultProfilePic2,
            defaultProfilePic3,
            defaultProfilePic4
        ];
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
        let pricingData = this.context;

        (function() {
            setTimeout(function() {
                let carouselInterval       = null,
                    firstVisibleIndex      = 0,
                    maxVisibleReviews      = 3,
                    $testimonialsSection   = document.querySelector('.fs-section--testimonials'),
                    $track                 = $testimonialsSection.querySelector('.fs-testimonials-track'),
                    $testimonials          = $track.querySelectorAll('.fs-testimonial'),
                    $clones                = $track.querySelectorAll('.fs-testimonial.clone'),
                    uniqueTestimonials     = ($testimonials.length - $clones.length),
                    $testimonialsContainer = $track.querySelector('.fs-testimonials'),
                    sectionWidth,
                    cardMinWidth           = 250,
                    visibleCards,
                    cardWidth,
                    speed                  = 10000,
                    isCarouselActive       = false;

                let slide = function (selectedIndex, isInvisible) {
                    isInvisible = isInvisible || false;

                    if (isInvisible)
                        $testimonialsSection.classList.remove('ready');

                    let shiftedIndex   = maxVisibleReviews + selectedIndex,
                        selectedBullet = ((selectedIndex % uniqueTestimonials) + uniqueTestimonials) % uniqueTestimonials;

                    $testimonialsSection.querySelector('.slick-dots li.selected').classList.remove('selected');

                    Array.from($testimonialsSection.querySelectorAll('.slick-dots li')).forEach(button => {
                        if (selectedBullet == button.getAttribute('data-index')) {
                            button.classList.add('selected');
                        }
                    });

                    $testimonialsContainer.style.left = ((-1)*(shiftedIndex * cardWidth) + 'px');

                    for (let $testimonial of $testimonials) {
                        $testimonial.setAttribute('aria-hidden', 'true');
                    }

                    for (let i = 0; i < visibleCards; i++) {
                        $testimonials[i + shiftedIndex].setAttribute('aria-hidden', 'false');
                    }

                    if (isInvisible)
                        setTimeout(function() {
                            $testimonialsSection.classList.add('ready');
                        }, 500);

                    if (selectedIndex == uniqueTestimonials) {
                        // Jump back to first testimonial without a transition.
                        firstVisibleIndex = 0;

                        setTimeout(function() {
                            slide(firstVisibleIndex, true);
                        }, 1000);
                    }

                    if (selectedIndex == -visibleCards){
                        // Jump forward to relevant testimonial.
                        firstVisibleIndex = selectedIndex + uniqueTestimonials;

                        setTimeout(function() {
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

                let nextSlide = function () {
                    firstVisibleIndex++;
                    slide(firstVisibleIndex);
                };

                let prevSlide = function () {
                    firstVisibleIndex--;
                    slide(firstVisibleIndex);
                };

                let startSliderInterval = function ()
                {
                    if ( ! isCarouselActive) {
                        return;
                    }

                    if (visibleCards < $testimonials.length) {
                        carouselInterval = setInterval(function() {
                            nextSlide();
                        }, speed);
                    }
                };

                let adjustTestimonials = function ()
                {
                    clearSliderInterval();

                    $testimonialsSection.classList.remove('ready');

                    sectionWidth = parseFloat(window.getComputedStyle($track).width);

                    if (sectionWidth < cardMinWidth) {
                        // In case of `sectionWidth` is below `cardMinWidth`, we should reduce `cardMinWidth`
                        // by `sectionWidth` to set the width of the testimonial accordingly.
                        cardMinWidth = sectionWidth;
                    }

                    visibleCards = Math.min(maxVisibleReviews, Math.floor(sectionWidth / cardMinWidth));
                    cardWidth    = Math.floor(sectionWidth / visibleCards);

                    $testimonialsContainer.style.width = (($testimonials.length * cardWidth) + 'px');

                    for (let $testimonial of $testimonials) {
                        $testimonial.style.width = (cardWidth + 'px');
                    }

                    let maxHeaderHeight  = 0;
                    let maxContentHeight = 0;

                    for (let i = 0; i < $testimonials.length; i++) {
                        let $testimonial        = $testimonials[i],
                            $testimonialHeader  = $testimonial.querySelector('header'),
                            $testimonialSection = $testimonial.querySelector('section');

                        // Since each height was fixed before, we should change it to the original height and then pick the maximum one.
                        $testimonialHeader.style.height = '100%';
                        $testimonialSection.style.height = '100%';

                        maxHeaderHeight  = Math.max(maxHeaderHeight, parseFloat(window.getComputedStyle($testimonialHeader).height));
                        maxContentHeight = Math.max(maxContentHeight, parseFloat(window.getComputedStyle($testimonialSection).height));
                    }

                    for (let i = 0; i < $testimonials.length; i++) {
                        let $testimonial        = $testimonials[i],
                            $testimonialHeader  = $testimonial.querySelector('header'),
                            $testimonialSection = $testimonial.querySelector('section');

                        $testimonialHeader.style.height = (maxHeaderHeight + 'px');
                        $testimonialSection.style.height = (maxContentHeight + 'px');
                    }

                    $testimonialsContainer.style.left = ('left',  (-1)*((firstVisibleIndex + maxVisibleReviews) * cardWidth) + 'px');

                    $testimonialsSection.classList.add('ready');

                    isCarouselActive = (uniqueTestimonials > visibleCards);

                    // Show/hide carousel buttons.
                    Array.from($testimonialsSection.querySelectorAll('.slick-arrow, .slick-dots')).forEach(button => {
                        button.style.display = isCarouselActive ? 'block' : 'none';
                    });
                };

                adjustTestimonials();

                startSliderInterval();

                $testimonialsSection.querySelector('.fs-nav-next').addEventListener('click', function() {
                    clearSliderInterval();
                    nextSlide();
                    startSliderInterval();
                });

                $testimonialsSection.querySelector('.fs-nav-prev').addEventListener('click', function() {
                    clearSliderInterval();
                    prevSlide();
                    startSliderInterval();
                });

                Array.from($testimonialsSection.querySelectorAll('.slick-dots li')).forEach(button => {
                    button.addEventListener('click', function(evt) {
                        let parent = null;

                        if ('span' === evt.target.tagName.toLowerCase()) {
                            parent = evt.target.parentNode.parentNode;
                        } else if ('button' === evt.target.tagName.toLowerCase()) {
                            parent = evt.target.parentNode;
                        } else {
                            parent = evt.target;
                        }

                        if (parent.classList.contains('selected')) {
                            return;
                        }

                        clearSliderInterval();
                        firstVisibleIndex = parseInt(parent.getAttribute('data-index'));
                        slide(firstVisibleIndex);
                        startSliderInterval();
                    });
                });

                window.addEventListener('resize', function() {
                    adjustTestimonials();

                    startSliderInterval();
                });
            }, 10);
        })();

        let reviews           = [];
        let maxVisibleReviews = 3;
        let reviewsCount      = pricingData.reviews.length;
        let dots              = [];

        for (let i = -maxVisibleReviews; i < reviewsCount + maxVisibleReviews; i ++) {
            let review = pricingData.reviews[(i % reviewsCount + reviewsCount) % reviewsCount];

            let defaultPicIndex = review.email ?
                ((review.email.charAt(0).toLowerCase()).charCodeAt(0) - ('a').charCodeAt(0)) % 5 :
                Math.floor(Math.random() * 4);

            let defaultPicUrl = this.defaultProfilePics[defaultPicIndex];

            reviews.push(
                <section className={'fs-testimonial' + ((i < 0 || i >= reviewsCount) ? ' clone' : '')} data-index={i} data-id={review.id} key={i}>
                    <header className="fs-testimonial-header">
                        <div className="fs-testimonial-logo">
                            <object
                                data={
                                    review.email ?
                                        '//gravatar.com/avatar/' + md5(review.email) + '?s=80&d=' + encodeURIComponent(defaultPicUrl) :
                                        defaultPicUrl
                                    }
                                type="image/png"
                            >
                                <img src={defaultPicUrl} />
                            </object>
                        </div>
                        <h4>{review.title}</h4>
                        <div className="fs-testimonial-rating">
                            {this.getReviewRating(review)}
                        </div>
                    </header>
                    <section>
                        <Icon icon={['fas', 'quote-left']} className="fs-icon-quote" />
                        <blockquote className="fs-testimonial-message" dangerouslySetInnerHTML={{__html: review.text}}></blockquote>
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
                    <RoundButton type="button" role="button" tabIndex="0" />
                </li>
            );
        }

        return (
            <Fragment>
                {pricingData.active_installs > 1000 &&
                    <header className="fs-section-header"><h2>Trusted by More than { Helper.formatNumber(Math.ceil(pricingData.active_installs/1000) * 1000) } Blogs, Online Shops & Websites!</h2></header>
                }
                {pricingData.active_installs <= 1000 && pricingData.downloads > 1000 &&
                    <header className="fs-section-header"><h2>Downloaded More than { Helper.formatNumber(Math.ceil(pricingData.downloads/1000) * 1000) } Times!</h2></header>
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