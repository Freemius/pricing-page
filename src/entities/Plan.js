import {Helper} from "../Helper";

export class Plan {

    //region Properties

    is_block_features = null;

    is_block_features_monthly = null;

    is_success_manager = null;

    support_email = null;

    support_forum = null;

    support_phone = null;

    support_skype = null;

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

    hasEmailSupport() {
        return (Helper.isString(this.support_email) && this.support_email.length > 0);
    }

    hasForumSupport() {
        return (Helper.isString(this.support_forum) && this.support_forum.length > 0);
    }

    hasPhoneSupport() {
        return (Helper.isString(this.support_phone) && this.support_phone.length > 0);
    }

    hasSkypeSupport() {
        return (Helper.isString(this.support_skype) && this.support_skype.length > 0);
    }

    hasSuccessManagerSupport() {
        return (true == this.is_success_manager);
    }

    hasAnySupport()
    {
        return (
            this.hasEmailSupport() ||
            this.hasForumSupport() ||
            this.hasPhoneSupport() ||
            this.hasSkypeSupport() ||
            this.hasSuccessManagerSupport()
        );
    }

    isBlockingMonthly() {
        return (true == this.is_block_features_monthly);
    }

    isBlockingAnnual() {
        return (true == this.is_block_features);
    }
}