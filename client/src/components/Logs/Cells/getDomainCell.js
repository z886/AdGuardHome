import React from 'react';
import classNames from 'classnames';
import nanoid from 'nanoid';
import { Trans } from 'react-i18next';
import getHintElement from './getHintElement';
import {
    checkFiltered,
    formatDateTime,
    formatElapsedMs,
    formatTime, getProtocolName,
    REQ_STATUS_TO_LABEL_MAP,
} from '../../../helpers/helpers';
import {
    BLOCK_ACTIONS,
    DEFAULT_SHORT_DATE_FORMAT_OPTIONS,
    LONG_TIME_FORMAT,
    RECORD_TO_IP_MAP,
} from '../../../helpers/constants';

const processContent = (data, buttonType) => Object.entries(data)
    .map(([key, value]) => {
        const isTitle = value === 'title';
        const isButton = key === `${buttonType}_btn`;
        const isBoolean = typeof value === 'boolean';

        let keyClass = 'key-colon';

        if (isTitle) {
            keyClass = 'title--border';
        }
        if (isButton || isBoolean) {
            keyClass = '';
        }

        return (
            <React.Fragment key={nanoid()}>
                <div className={keyClass}>
                    <Trans>{isButton ? value : key}</Trans>
                </div>
                <div className="text-pre text-truncate">
                    <Trans>{(isTitle || isButton || isBoolean) ? '' : value || '—'}</Trans>
                </div>
            </React.Fragment>
        );
    });

const getDomainCell = (row, t, isDetailed, toggleBlocking, autoClients) => {
    const {
        value, upstream, original: {
            time, tracker, elapsedMs, reason, domain, response, type, client, answer_dnssec,
        },
    } = row;

    const autoClient = autoClients.find(autoClient => autoClient.name === client);
    const hasTracker = !!tracker;

    const source = tracker && tracker.sourceData && tracker.sourceData.name;

    const lockIconClass = classNames('icons', 'icon--small', 'd-none', 'd-sm-block', 'cursor--pointer', {
        'icon--active': answer_dnssec,
        'icon--disabled': !answer_dnssec,
        'my-3': isDetailed,
    });

    const privacyIconClass = classNames('icons', 'mx-2', 'icon--small', 'd-none', 'd-sm-block', 'cursor--pointer', {
        'icon--active': hasTracker,
        'icon--disabled': !hasTracker,
        'my-3': isDetailed,
    });

    const dnssecHint = getHintElement({
        className: lockIconClass,
        tooltipClass: 'py-4 px-5 pb-45',
        dataTip: answer_dnssec,
        xlinkHref: 'lock',
        columnClass: 'w-100',
        content: 'validated_with_dnssec',
        place: 'bottom',
    });

    const data = {
        name_table_header: tracker && tracker.name,
        category_label: tracker && tracker.category,
        source_label: source && <a href={`//${source}`} className="link--green">{source}</a>,
    };

    const trackerHint = getHintElement({
        className: privacyIconClass,
        tooltipClass: 'pt-4 pb-5 px-5',
        dataTip: hasTracker,
        xlinkHref: 'privacy',
        contentItemClass: 'key-colon',
        content: Object.entries(data),
        columnClass: 'grid--gap-bg',
        title: 'known_tracker',
        place: 'bottom',
    });

    const formattedElapsedMs = formatElapsedMs(elapsedMs, t);
    const isFiltered = checkFiltered(reason);
    const buttonType = isFiltered ? BLOCK_ACTIONS.unblock : BLOCK_ACTIONS.block;

    const onToggleBlock = () => {
        toggleBlocking(buttonType, domain);
    };

    const detailedData = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        details: 'title',
        install_settings_dns: upstream,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        client_details: 'title',
        country: autoClient && autoClient.country,
        network: autoClient && autoClient.orgname,
        source_label: source && <a href={`//${source}`} className="link--green">{source}</a>,
        [`${buttonType}_btn`]: <div onClick={onToggleBlock}
                                    className="title--border">{t(`${buttonType}_btn`)}</div>,
    };

    const detailedDataBlocked = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: REQ_STATUS_TO_LABEL_MAP[reason] || reason,
        domain,
        known_tracker: 'title',
        table_name: hasTracker && tracker.name,
        category_label: hasTracker && tracker.category,
        source_label: source && <a href={`//${source}`} className="link--green">{source}</a>,
        details: 'title',
        install_settings_dns: upstream,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        validated_with_dnssec: answer_dnssec, // Boolean
        [`${buttonType}_btn`]: <div onClick={onToggleBlock}
                                    className="title--border">{t(`${buttonType}_btn`)}</div>,
    };

    const detailedDataCurrent = isFiltered ? detailedDataBlocked : detailedData;

    const detailedHint = getHintElement({
        className: 'icons icon--small d-block d-md-none icon--active icon--detailed-info',
        tooltipClass: 'ml-0 w-100 h-100',
        dataTip: true,
        xlinkHref: 'options_dots',
        contentItemClass: 'text-pre text-truncate key-colon',
        renderContent: processContent(detailedDataCurrent, buttonType),
        trigger: 'click',
        overridePosition: () => ({
            left: 0,
            top: 0,
        }),
        scrollHide: false,
    });

    const ip = RECORD_TO_IP_MAP[type] || '';
    const protocol = t(getProtocolName(upstream));

    return (
        <div className="logs__row o-hidden" title={value}>
            {dnssecHint}
            {trackerHint}
            <div className={`${isDetailed ? 'px-2' : ''}`}>
                <div className="logs__text o-hidden text-truncate">{value}</div>
                {isDetailed &&
                <div
                    className="detailed-info d-none d-sm-block">{`${ip}${ip && protocol && ', '}${protocol}`}</div>}
            </div>
            {detailedHint}
        </div>

    );
};

export default getDomainCell;
