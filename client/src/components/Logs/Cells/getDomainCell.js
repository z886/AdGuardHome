import React from 'react';
import classNames from 'classnames';
import { nanoid } from 'nanoid';
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
        const isButton = key === buttonType;
        const isBoolean = typeof value === 'boolean';
        const isHidden = isBoolean && value === false;

        let keyClass = 'key-colon';

        if (isTitle) {
            keyClass = 'title--border';
        }
        if (isButton || isBoolean) {
            keyClass = '';
        }

        return isHidden ? null : <React.Fragment key={nanoid()}>
            <div
                className={`key__${key} ${keyClass} ${(isBoolean && value === true) ? 'font-weight-bold' : ''}`}>
                <Trans>{isButton ? value : key}</Trans>
            </div>
            <div className={`value__${key} text-pre text-truncate`}>
                <Trans>{(isTitle || isButton || isBoolean) ? '' : value || '—'}</Trans>
            </div>
        </React.Fragment>;
    });

const getDomainCell = (row, t, isDetailed, toggleBlocking, autoClients) => {
    const {
        value, original: {
            time, tracker, elapsedMs, reason, domain, response,
            type, client, answer_dnssec, upstream, info,
        },
    } = row;

    const autoClient = autoClients.find((autoClient) => autoClient.name === client);
    const country = autoClient && autoClient.whois_info && autoClient.whois_info.country;
    const network = autoClient && autoClient.whois_info && autoClient.whois_info.orgname;

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

    const status = t(REQ_STATUS_TO_LABEL_MAP[reason] || reason);
    const statusBlocked = <div className="bg--danger">{status}</div>;

    const detailedData = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: status,
        domain,
        details: 'title',
        install_settings_dns: upstream,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        client_details: 'title',
        name: info && info.name,
        ip_address: client,
        country,
        network,
        validated_with_dnssec: Boolean(answer_dnssec),
        [buttonType]: <div onClick={onToggleBlock}
                           className="title--border bg--danger">{t(buttonType)}</div>,
    };

    const detailedDataBlocked = {
        time_table_header: formatTime(time, LONG_TIME_FORMAT),
        data: formatDateTime(time, DEFAULT_SHORT_DATE_FORMAT_OPTIONS),
        encryption_status: statusBlocked,
        domain,
        known_tracker: 'title',
        table_name: hasTracker && tracker.name,
        category_label: hasTracker && tracker.category,
        source_label: source && <a href={`//${source}`} className="link--green">{source}</a>,
        details: 'title',
        install_settings_dns: upstream,
        elapsed: formattedElapsedMs,
        request_table_header: response && response.join('\n'),
        [buttonType]: <div onClick={onToggleBlock}
                           className="title--border">{t(buttonType)}</div>,
    };

    const detailedDataCurrent = isFiltered ? detailedDataBlocked : detailedData;

    const detailedHint = getHintElement({
        className: 'icons icon--small d-block d-md-none icon--active icon--detailed-info',
        tooltipClass: 'ml-0 w-100 mh-100 pt-4 pb-2 h-85',
        dataTip: true,
        xlinkHref: 'options_dots',
        contentItemClass: 'text-pre text-truncate key-colon',
        renderContent: processContent(detailedDataCurrent, buttonType),
        trigger: 'click',
        columnClass: `pb-2 ${isFiltered ? 'logs--detailed--blocked' : 'logs--detailed'}`,
        overridePosition: () => ({
            left: 0,
            top: 47,
        }),
        scrollHide: false,
    });

    const ip = RECORD_TO_IP_MAP[type] || '';
    const protocol = t(getProtocolName(upstream));

    return (
        <div className="logs__row o-hidden" title={value}>
            {dnssecHint}
            {trackerHint}
            <div className={`${isDetailed ? 'px-2 w-100 d-flex justify-content-center flex-column' : ''}`}>
                <div className="logs__text o-hidden text-truncate">{value}</div>
                {(ip || protocol) && isDetailed
                && <div className="detailed-info d-none d-sm-block">
                    {`${ip}${ip && protocol && ', '}${protocol}`}
                </div>}
            </div>
            {detailedHint}
        </div>

    );
};

export default getDomainCell;
