import React from 'react';
import classNames from 'classnames';
import getHintElement from './getHintElement';

const getDomainCell = (row, isDetailed) => {
    const { value, answer_dnssec, original: { tracker } } = row;
    const hasTracker = !!tracker;

    const lockIconClass = classNames('icons', 'icon--small', {
        'icon--active': answer_dnssec,
        'icon--disabled': !answer_dnssec,
    });

    const privacyIconClass = classNames('icons', 'mx-2', 'icon--small', {
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

    return (
        <div className="logs__row" title={value}>
            {dnssecHint}
            {trackerHint}
            <div>
                <div className="logs__text">{value}</div>
                {isDetailed &&
                <div className="detailed-info">Ipv6, DNS-over-HTTPS stub</div>}
            </div>
        </div>

    );
};

export default getDomainCell;
