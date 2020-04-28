import React from 'react';
import classNames from 'classnames';
import nanoid from 'nanoid';
import { Trans } from 'react-i18next';
import getHintElement from './getHintElement';
import {
    formatDateTime,
    formatElapsedMs,
    formatTime,
    REQ_STATUS_TO_LABEL_MAP,
} from '../../../helpers/helpers';
import {
    DEFAULT_SHORT_DATE_FORMAT_OPTIONS,
    FILTERED_STATUS,
    LONG_TIME_FORMAT,
} from '../../../helpers/constants';

const getDomainCell = (row, t, isDetailed) => {
    const {
        value, answer_dnssec, original: {
            time, tracker, elapsedMs, reason, domain, response,
        },
    } = row;

    const hasTracker = !!tracker;

    const lockIconClass = classNames('icons', 'icon--small', 'd-none', 'd-sm-block', {
        'icon--active': answer_dnssec,
        'icon--disabled': !answer_dnssec,
    });

    const privacyIconClass = classNames('icons', 'mx-2', 'icon--small', 'd-none', 'd-sm-block', {
        'icon--active': hasTracker,
        'icon--disabled': !hasTracker,
    });

    const dnssecHint = getHintElement({
        className: lockIconClass,
        dataTip: answer_dnssec,
        xlinkHref: 'lock',
        columnClass: 'w-100',
        content: 'validated_with_dnssec',
    });

    const data = {
        name_table_header: tracker && tracker.name,
        category_label: tracker && tracker.category,
        source_label: tracker && tracker.sourceData && tracker.sourceData.name,
    };

    const link = data.source_label;

    data.source_label = <a href={`//${link}`} key={link}>{link}</a>;
    const trackerHint = getHintElement({
        className: privacyIconClass,
        dataTip: hasTracker,
        xlinkHref: 'privacy',
        contentItemClass: 'key-colon',
        content: Object.entries(data),
        title: 'known_tracker',
        place: 'bottom',
    });

    const formattedElapsedMs = formatElapsedMs(elapsedMs, t);

    const isBlockedStatus = reason === FILTERED_STATUS.FILTERED_BLOCKED_SERVICE;

    const blockingTypeBtn = isBlockedStatus ? 'block_btn' : 'unblock_btn';

    const detailedData = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        details: 'title',
        install_settings_dns: domain,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        client_details: 'title',
        country: 'country_stub',
        network: 'network_stub',
        source_label: tracker && tracker.sourceData && tracker.sourceData.name,
        [blockingTypeBtn]: 'title',
    };

    const detailedDataBlocked = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        known_tracker: 'title',
        table_name: hasTracker && tracker.name,
        category_label: hasTracker && tracker.category,
        source_label: hasTracker && tracker.sourceData && tracker.sourceData.name,
        details: 'title',
        install_settings_dns: domain,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        validated_with_dnssec: answer_dnssec, // Boolean
        [blockingTypeBtn]: 'title',
    };

    const detailedDataCurrent = isBlockedStatus ? detailedDataBlocked : detailedData;

    const processContent = data => Object.entries(data)
        .map(([key, value]) => {
            if (!value) {
                return undefined;
            }

            const isTitle = value === 'title';
            const isBoolean = typeof value === 'boolean';

            let keyClass = 'key-colon';

            if (isTitle) {
                keyClass = 'title--border';
            }
            if (isBoolean) {
                keyClass = '';
            }

            return (
                <React.Fragment key={nanoid()}>
                    <div className={keyClass}>
                        <Trans>{key}</Trans>
                    </div>
                    <div className="text-pre">
                        <Trans>{(isTitle || isBoolean) ? '' : value}</Trans>
                    </div>
                </React.Fragment>);
        });

    const detailedHint = getHintElement({
        className: 'icons icon--small d-block d-sm-none icon--active',
        tooltipClass: 'ml-0 w-100',
        dataTip: true,
        xlinkHref: 'options_dots',
        contentItemClass: 'text-pre key-colon',
        renderContent: processContent(detailedDataCurrent),
        trigger: 'click',
        overridePosition: () => ({
            left: 0,
            top: 0,
        }),
        scrollHide: false,
    });

    return (
        <div className="logs__row logs__row--overflow" title={value}>
            {dnssecHint}
            {trackerHint}
            <div>
                <div className="logs__text">{value}</div>
                {isDetailed &&
                <div className="detailed-info d-none d-sm-block">Ipv6, DNS-over-HTTPS stub</div>}
            </div>
            {detailedHint}
        </div>

    );
};

export default getDomainCell;
