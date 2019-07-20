import {Helper} from "../Helper";

/**
 * @author Leo Fajardo
 */
export class Plan {

    //region Properties

    /**
     * @type boolean
     */
    is_block_features = true;

    /**
     * @type boolean
     */
    is_block_features_monthly = true;

    /**
     * @type boolean
     */
    is_require_subscription = true;

    /**
     * @type boolean If true, the plan supports personal success manager.
     */
    is_success_manager = false;

    /**
     * @type string Support email address.
     */
    support_email = '';

    /**
     * @type string Support forum URL.
     */
    support_forum = '';

    /**
     * @type string Support phone number.
     */
    support_phone = '';

    /**
     * @type string Skype support username.
     */
    support_skype = '';

    /**
     * @type int Trial days.
     */
    trial_period = 0;

    //endregion Properties

    constructor(object = null) {
        if (null == object) {
            return;
        }

        for (const p in object) {
            if (object.hasOwnProperty(p)) {
                this[p] = object[p];
            }
        }
    }

    /**
     * @returns {boolean} True if the plan has any kind of support.
     */
    hasAnySupport() {
        return (
            this.hasEmailSupport() ||
            this.hasForumSupport() ||
            this.hasPhoneSupport() ||
            this.hasSkypeSupport() ||
            this.hasSuccessManagerSupport()
        );
    }

    hasEmailSupport() {
        return (Helper.isNonEmptyString(this.support_email));
    }

    hasForumSupport() {
        return (Helper.isNonEmptyString(this.support_forum));
    }

    hasKnowledgeBaseSupport() {
        return (Helper.isNonEmptyString(this.support_kb));
    }

    hasPhoneSupport() {
        return (Helper.isNonEmptyString(this.support_phone));
    }

    hasSkypeSupport() {
        return (Helper.isNonEmptyString(this.support_skype));
    }

    hasSuccessManagerSupport() {
        return (true == this.is_success_manager);
    }

    hasTrial() {
        return (Helper.isNumeric(this.trial_period) && this.trial_period > 0);
    }

    isBlockingMonthly() {
        return (true == this.is_block_features_monthly);
    }

    isBlockingAnnually() {
        return (true == this.is_block_features);
    }

    requiresSubscription() {
        return this.is_require_subscription;
    }
}