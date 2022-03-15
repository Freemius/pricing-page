import React, { useEffect, useRef, useState } from 'react';
import Icon from "../Icon";

import './style.scss';

export default function Tooltip({ children }) {
    // Enum: 'none' | top | right | top-right
    const [currentTooltipPosition, setCurrentTooltipPosition] = useState('none');
    const tooltipMessageRef = useRef(null);

    const showTooltip = () => {
        // If for some reason, our tooltip `span` still hasn't rendered, then bail.
        if (!tooltipMessageRef.current) {
            return;
        }

        // Do the calculate when react is about to flush the state so that there's no race
        // condition during the react-fibre execution.
        setCurrentTooltipPosition(currentPosition => {
            // Don't recalculate if already showing.
            if ('none' !== currentPosition) {
                // NOTE: This does not cause a re-render.
                return currentPosition;
            }

            const rect = tooltipMessageRef.current.getBoundingClientRect();

            // This calculation is patchy and is breaking a lot of react standards
            // but we are doing it to "make it work™️" as our tooltip use-case is
            // very limited and we would rather avoid adding another library if
            // we could.
            const packagesContainer = tooltipMessageRef.current.closest('.fs-packages-nav');
            const packagesRect = packagesContainer.getBoundingClientRect();

            // The width of the tooltip is hard-coded in the CSS (./style.scss)
            const WIDTH_OF_TOOLTIP_CONTAINER = 200;

            // Need 50px breathing space after the tooltip to make a better "UX".
            const BREATHING_SPACE = 50;

            let spaceAvailableOnRightOfPackagesContainer = packagesRect.right - rect.right;
            let neededTooltipSpaceOnRight = WIDTH_OF_TOOLTIP_CONTAINER + BREATHING_SPACE;

            // First try to position it on right.
            let position = 'right';

            // If space available on the right is not enough, then try to show it to the top.
            if (neededTooltipSpaceOnRight > spaceAvailableOnRightOfPackagesContainer) {
                position = 'top';
                neededTooltipSpaceOnRight = WIDTH_OF_TOOLTIP_CONTAINER / 2 + BREATHING_SPACE;

                // If there's not enough space, then show it to the top-right.
                if (neededTooltipSpaceOnRight > spaceAvailableOnRightOfPackagesContainer) {
                    position = 'top-right';
                }

                /**
                 * The top-right positioning is kind of our fail-safe, because
                 * if the `neededTooltipSpaceOnRight` is still greater than
                 * `spaceAvailableOnRightOfPackagesContainer`, then the wrapper
                 * packages does not have sufficient width itself.
                 *
                 * This is a very edge case scenario and we could probably show
                 * a dialog here, but it is not needed at the moment.
                 */
            }

            return position;
        });
    };

    const hideTooltip = () => {
        setCurrentTooltipPosition('none');
    };

    // Add a listener to the document to flush out the active tooltip if any.
    useEffect(() => {
        if (currentTooltipPosition === 'none') {
            // return a no-op
            return () => {};
        }

        // Since we are showing the tooltip, clear it if clicking somewhere else.
        const handler = e => {
            // But not, if clicking the tooltip initiator.
            if (
                e.target === tooltipMessageRef.current ||
                tooltipMessageRef.current.contains(e.target)
            ) {
                return;
            }

            setCurrentTooltipPosition('none');
        };

        document.addEventListener('click', handler);

        // Clear it after unmount
        return () => {
            document.removeEventListener('click', handler);
        };
    }, [currentTooltipPosition]);

    return (
        <span
            className="fs-tooltip"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            ref={tooltipMessageRef}
            onClick={showTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            tabIndex={0}
        >
            <Icon icon="question-circle" />
            <span
                className={`fs-tooltip-message fs-tooltip-message--position-${currentTooltipPosition}`}
            >
                {children}
            </span>
        </span>
    )
}
