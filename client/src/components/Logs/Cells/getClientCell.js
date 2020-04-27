import React from 'react';
import nanoid from 'nanoid';
import escapeRegExp from 'lodash/escapeRegExp';
import endsWith from 'lodash/endsWith';
import { formatClientCell } from '../../../helpers/formatClientCell';
import getHintElement from './getHintElement';
import CustomTooltip from '../Tooltip/CustomTooltip';
import { checkFiltered } from '../../../helpers/helpers';

const getClientCell = (
    row, t, isDetailed, userRules,
    setRules, addSuccessToast, getFilteringStatus,
) => {
    const {
        reason, client, domain, info: { name },
    } = row.original;
    const id = nanoid();

    const data = {
        table_name: domain,
        ip: client,
        dhcp_table_hostname: 'hostname_stub',
        country: 'country_stub',
        network: 'network_stub',
    };

    const blockingTypes = {
        block: 'block',
        unblock: 'unblock',
    };

    const toggleBlocking = (type, domain) => {
        const lineEnding = !endsWith(userRules, '\n') ? '\n' : '';
        const baseRule = `||${domain}^$important`;
        const baseUnblocking = `@@${baseRule}`;

        const blockingRule = type === blockingTypes.block ? baseUnblocking : baseRule;
        const unblockingRule = type === blockingTypes.block ? baseRule : baseUnblocking;
        const preparedBlockingRule = new RegExp(`(^|\n)${escapeRegExp(blockingRule)}($|\n)`);
        const preparedUnblockingRule = new RegExp(`(^|\n)${escapeRegExp(unblockingRule)}($|\n)`);

        if (userRules.match(preparedBlockingRule)) {
            setRules(userRules.replace(`${blockingRule}`, ''));
            addSuccessToast(`${t('rule_removed_from_custom_filtering_toast')}: ${blockingRule}`);
        } else if (!userRules.match(preparedUnblockingRule)) {
            setRules(`${userRules}${lineEnding}${unblockingRule}\n`);
            addSuccessToast(`${t('rule_added_to_custom_filtering_toast')}: ${unblockingRule}`);
        }

        getFilteringStatus();
    };

    const isFiltered = checkFiltered(reason);
    const buttonType = isFiltered ? blockingTypes.unblock : blockingTypes.block;
    const optionName = isFiltered ? 'remove_domain_from_whitelist' : 'add_domain_to_whitelist';

    const optionsToHandlerMap = {
        [optionName]: () => toggleBlocking(buttonType, domain),
    };

    const options = Object.entries(optionsToHandlerMap)
        .map(([option, handler]) => <div key={option} onClick={handler}>{t(option)}</div>);

    return (
        <div className="logs__row logs__row--overflow justify-content-between">
            <div>
                {<div data-tip={true} data-for={id}>{formatClientCell(row, t, isDetailed)}</div>}
                {isDetailed && <div className="detailed-info d-none d-sm-block">{name}</div>}
            </div>
            {<CustomTooltip id={id} place="left" title="client_details"
                            contentItemClass='key-colon'
                            content={Object.entries(data)} />}
            {getHintElement({
                className: 'icons mt-3 icon--small',
                dataTip: true,
                xlinkHref: 'options_dots',
                contentItemClass: 'tooltip__option py-3 px-5 key-colon',
                columnClass: 'h-100 grid__one-row',
                content: options,
                place: 'left',
                tooltipClass: 'px-0 py-3',
            })}
        </div>
    );
};

export default getClientCell;
