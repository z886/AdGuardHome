import React from 'react';
import classNames from 'classnames';
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

    const blockingTypes = {
        block: 'block',
        unblock: 'unblock',
    };

    const formattedElapsedMs = formatElapsedMs(elapsedMs, t);

    const isBlockedStatus = reason === FILTERED_STATUS.FILTERED_BLACK_LIST;

    const detailedData = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        install_settings_dns: domain,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        country: 'country_stub',
        network: 'network_stub',
        source_label: tracker && tracker.sourceData && tracker.sourceData.name,
        block_btn: blockingTypes.block,
    };

    const detailedDataBlocked = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        name: hasTracker && tracker.name,
        category: hasTracker && tracker.category,
        source_label: hasTracker && tracker.sourceData && tracker.sourceData.name,
        install_settings_dns: domain,
        elapsed: formattedElapsedMs,
        [answer_dnssec ? 'validated_with_dnssec' : '']: undefined,
        unblock_btn: blockingTypes.unblock,
    };

    const detailedDataCurrent = isBlockedStatus ? detailedDataBlocked : detailedData;

    const detailedHint = getHintElement({
        className: 'icons icon--small d-block d-sm-none icon--active',
        tooltipClass: 'ml-0 w-100',
        dataTip: true,
        xlinkHref: 'options_dots',
        contentItemClass: 'text-pre key-colon',
        content: Object.entries(detailedDataCurrent),
        title: 'known_tracker',
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
