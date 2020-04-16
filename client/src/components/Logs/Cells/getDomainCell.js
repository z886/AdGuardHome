import React from 'react';
import classNames from 'classnames';
import CustomTooltip from '../Tooltip/CustomTooltip';
import getHintElement from './getHintElement';

const getDomainCell = (row) => {
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
        tooltipComponent: ({ id }) => <CustomTooltip id={id} className="custom-tooltip"
                                                     content="validated_with_dnssec" />,
    });

    const trackerHint = getHintElement({
        className: privacyIconClass,
        dataTip: hasTracker,
        xlinkHref: 'privacy',
        tooltipComponent: ({ id }) => <CustomTooltip id={id} rowClass="pr-4" title="known_tracker" content={{
            name_table_header: tracker.name,
            category_label: tracker.category,
            source_label: tracker.sourceData.name,
        }} />,
    });

    return (
        <div className="logs__row" title={value}>
            {dnssecHint}
            {trackerHint}
            <div className="logs__text">{value}</div>
        </div>
    );
};

export default getDomainCell;
