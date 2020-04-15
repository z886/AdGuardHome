import React from 'react';
import classNames from 'classnames';
import Trackers from '../Tooltip/Trackers';
import Dnssec from '../Tooltip/Dnssec';
import getHintElement from './getHintElement';

const getDomainCell = (row) => {
    const { value, answer_dnssec, original: { tracker } } = row;
    const hasTracker = !!tracker;

    const lockIconClass = classNames({
        icons: true,
        'icon--small': true,
        [`icon--${answer_dnssec ? 'active' : 'disabled'}`]: true,
    });

    const privacyIconClass = classNames({
        icons: true,
        'mx-2': true,
        'icon--small': true,
        [`icon--${hasTracker ? 'active' : 'disabled'}`]: true,
    });

    const dnssecHint = getHintElement({
        className: lockIconClass,
        dataTip: answer_dnssec,
        xlinkHref: 'lock',
        tooltipComponent: Dnssec,
    });

    const trackerHint = getHintElement({
        className: privacyIconClass,
        dataTip: hasTracker,
        xlinkHref: 'privacy',
        // eslint-disable-next-line react/display-name
        tooltipComponent: ({ id }) => <Trackers {...{
            ...tracker,
            id,
        }} />,
    });

    return (
        <div className="logs__row" title={value}>
            {dnssecHint}
            {trackerHint}
            <div className="logs__text">
                {value}
            </div>
        </div>
    );
};

export default getDomainCell;
