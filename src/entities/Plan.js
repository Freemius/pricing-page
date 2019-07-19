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
        return (Helper.isNonEmptyString(this.support_email));
    }

    hasKnowledgeBaseSupport() {
        return (Helper.isNonEmptyString(this.support_kb));
    }

    hasForumSupport() {
        return (Helper.isNonEmptyString(this.support_forum));
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