import React from 'react';
import nanoid from 'nanoid';
import { formatClientCell } from '../../../helpers/formatClientCell';
import getHintElement from './getHintElement';
import CustomTooltip from '../Tooltip/CustomTooltip';
import { checkFiltered } from '../../../helpers/helpers';
import { BLOCK_ACTIONS } from '../../../helpers/constants';

const getClientCell = (row, t, isDetailed, toggleBlocking) => {
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

    const isFiltered = checkFiltered(reason);
    const buttonType = isFiltered ? BLOCK_ACTIONS.unblock : BLOCK_ACTIONS.block;

    const optionsToHandlerMap = {
        [`${buttonType}_btn`]: () => toggleBlocking(buttonType, domain),
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
